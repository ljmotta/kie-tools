/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { Bullseye } from "@patternfly/react-core/dist/js/layouts/Bullseye";
import { DataTable, DataTableColumn } from "@kie-tools/runtime-tools-components/dist/components/DataTable";
import {
  KogitoEmptyState,
  KogitoEmptyStateType,
} from "@kie-tools/runtime-tools-components/dist/components/KogitoEmptyState";
import { LoadMore } from "@kie-tools/runtime-tools-components/dist/components/LoadMore";
import { KogitoSpinner } from "@kie-tools/runtime-tools-components/dist/components/KogitoSpinner";
import { ServerErrors } from "@kie-tools/runtime-tools-components/dist/components/ServerErrors";
import { OUIAProps, componentOuiaProps } from "@kie-tools/runtime-tools-components/dist/ouiaTools/OuiaUtils";
import {
  TaskListQueryFilter,
  TaskListSortBy,
  UserTaskInstance,
} from "@kie-tools/runtime-tools-process-gateway-api/dist/types";
import { SortByDirection } from "@patternfly/react-table/dist/js/components";
import { useCancelableEffect } from "@kie-tools-core/react-hooks/dist/useCancelableEffect";
import { Holder } from "@kie-tools-core/react-hooks/dist/Holder";
import { MessageBusClientApi } from "@kie-tools-core/envelope-bus/dist/api";
import { TaskListChannelApi, TaskListState } from "../../../api";
import TaskListToolbar from "../TaskListToolbar/TaskListToolbar";
import { getDateColumn, getDefaultColumn, getTaskDescriptionColumn, getTaskStateColumn } from "../utils/TaskListUtils";

export interface TaskListProps {
  isEnvelopeConnectedToChannel: boolean;
  initialState?: TaskListState;
  channelApi: MessageBusClientApi<TaskListChannelApi>;
  allTaskStates?: string[];
  activeTaskStates?: string[];
  currentUser?: string;
}

const UserTaskLoadingComponent = (
  <Bullseye>
    <KogitoSpinner spinnerText="Loading user tasks..." ouiaId="tasks-loading-tasks" />
  </Bullseye>
);

const TaskList: React.FC<TaskListProps & OUIAProps> = ({
  isEnvelopeConnectedToChannel,
  initialState,
  channelApi,
  allTaskStates,
  activeTaskStates,
  currentUser,
  ouiaId,
  ouiaSafe,
}) => {
  const [queryFilter, setQueryFilter] = useState<TaskListQueryFilter>({
    taskStates: [],
    taskNames: [],
  });
  const [allStates, setAllStates] = useState<string[]>([]);
  const [activeStates, setActiveStates] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<TaskListSortBy>({
    property: "lastUpdate",
    direction: "desc",
  });
  const [pageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [error, setError] = useState<any>(undefined);
  const [showEmptyFiltersError, setShowEmptyFiltersError] = useState<boolean>(false);
  const [tasks, setTasks] = useState<UserTaskInstance[]>([]);

  const columns: DataTableColumn[] = useMemo(
    () => [
      getTaskDescriptionColumn((task: UserTaskInstance): void =>
        channelApi.notifications.taskList__openTask.send(task)
      ),
      getDefaultColumn("processId", "Process", true),
      getDefaultColumn("priority", "Priority", true),
      getTaskStateColumn(),
      getDateColumn("started", "Started"),
      getDateColumn("lastUpdate", "Last update"),
    ],
    [channelApi.notifications]
  );

  const getTableSortBy = useCallback(() => {
    return {
      index: columns.findIndex((column) => column.path === sortBy.property),
      direction: sortBy.direction,
    };
  }, [columns, sortBy.direction, sortBy.property]);

  const doQueryTasks = useCallback(
    async (
      _offset: number,
      _limit: number,
      _resetTasks: boolean,
      _resetPagination: boolean = false,
      _loadMore: boolean = false
    ) => {
      setIsLoadingMore(_loadMore);
      setIsLoading(true);
      setError(null);

      try {
        const response: UserTaskInstance[] = await channelApi.requests.taskList__query(_offset, _limit);
        if (_resetTasks) {
          setTasks(response);
        } else {
          setTasks((currentTasks) => currentTasks.concat(response));
        }

        if (_resetPagination) {
          setOffset(_offset);
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [channelApi.requests]
  );

  const initDefault = useCallback(
    (canceled: Holder<boolean>) => {
      const defaultState: TaskListState = {
        filters: {
          taskStates: [...(activeTaskStates ?? [])],
          taskNames: [],
        },
        sortBy,
        currentPage: { offset: 0, limit: 10 },
      };
      return channelApi.requests
        .taskList__setInitialState(defaultState)
        .then(() => {
          if (canceled.get()) {
            return;
          }
          setQueryFilter(defaultState.filters);
          setSortBy(defaultState.sortBy);
          return doQueryTasks(0, pageSize, true);
        })
        .then(() => {
          if (canceled.get()) {
            return;
          }
          setIsLoading(false);
        });
    },
    [activeTaskStates, doQueryTasks, channelApi.requests, pageSize, sortBy]
  );

  const initWithState = useCallback(
    (canceled: Holder<boolean>, initialState: TaskListState) => {
      setQueryFilter(initialState.filters);
      setSortBy(initialState.sortBy);
      setOffset(initialState.currentPage.offset);

      const limit = initialState.currentPage.offset + pageSize;

      return channelApi.requests
        .taskList__setInitialState(initialState)
        .then(() => {
          if (canceled.get()) {
            return;
          }
          return doQueryTasks(0, limit, true);
        })
        .then(() => {
          if (canceled.get()) {
            return;
          }
          setIsLoading(false);
        });
    },
    [doQueryTasks, channelApi.requests, pageSize]
  );

  const doApplyFilter = useCallback(
    async (filter: TaskListQueryFilter) => {
      setQueryFilter(filter);
      if (!filter || (_.isEmpty(filter.taskStates) && _.isEmpty(filter.taskNames))) {
        setShowEmptyFiltersError(true);
        return;
      }
      setShowEmptyFiltersError(false);
      setIsLoading(true);
      await channelApi.requests.taskList__applyFilter(filter);
      doQueryTasks(0, pageSize, true, true);
    },
    [doQueryTasks, channelApi.requests, pageSize]
  );

  const doRefresh = useCallback(async () => {
    setIsLoading(true);
    doQueryTasks(0, pageSize, true, true);
  }, [doQueryTasks, pageSize]);

  const onSort = useCallback(
    async (index: number, direction: SortByDirection) => {
      const sortObj: TaskListSortBy = {
        property: columns[index].path,
        direction: direction.toLowerCase() as SortByDirection,
      };
      await channelApi.requests.taskList__applySorting(sortObj);
      setSortBy(sortObj);
      setIsLoading(true);
      await doQueryTasks(0, pageSize, true, true);
    },
    [columns, doQueryTasks, channelApi.requests, pageSize]
  );

  useCancelableEffect(
    useCallback(
      ({ canceled }) => {
        if (isEnvelopeConnectedToChannel && currentUser && currentUser.length > 0) {
          initDefault(canceled);
        }
      },
      [currentUser, initDefault, isEnvelopeConnectedToChannel]
    )
  );

  useCancelableEffect(
    useCallback(
      ({ canceled }) => {
        if (!isEnvelopeConnectedToChannel) {
          setIsLoading(true);
          return;
        } else {
          setAllStates(allTaskStates ?? []);
          setActiveStates(activeTaskStates ?? []);
          if (!initialState) {
            initDefault(canceled);
          } else {
            initWithState(canceled, initialState);
          }
        }
      },
      [activeTaskStates, allTaskStates, initDefault, initWithState, initialState, isEnvelopeConnectedToChannel]
    )
  );

  const mustShowMore = useCallback((): boolean => {
    if (!isLoadingMore) {
      const limit = offset * pageSize + pageSize;
      return !isLoading && limit === tasks.length;
    }
    return true;
  }, [isLoading, isLoadingMore, offset, pageSize, tasks.length]);

  if (error) {
    return <ServerErrors error={error} variant={"large"} />;
  }

  return (
    <div {...componentOuiaProps(ouiaId, "tasks", ouiaSafe)}>
      <TaskListToolbar
        activeFilter={queryFilter}
        allTaskStates={allStates}
        activeTaskStates={activeStates}
        applyFilter={doApplyFilter}
        refresh={doRefresh}
      />
      {showEmptyFiltersError ? (
        <KogitoEmptyState
          type={KogitoEmptyStateType.Reset}
          title="No status is selected"
          body="Try selecting at least one status to see results"
          onClick={() => doApplyFilter({ taskStates: activeStates, taskNames: [] })}
          ouiaId="tasks-no-status"
        />
      ) : (
        <>
          <DataTable
            data={tasks}
            isLoading={isLoading}
            columns={columns}
            error={false}
            sortBy={getTableSortBy()}
            onSorting={onSort}
            LoadingComponent={UserTaskLoadingComponent}
          />
          {mustShowMore() && (
            <LoadMore
              offset={offset}
              setOffset={setOffset}
              getMoreItems={(_offset, _limit) => doQueryTasks(_offset, _limit, false, true, true)}
              pageSize={pageSize}
              isLoadingMore={isLoadingMore}
            />
          )}
        </>
      )}
    </div>
  );
};

export default TaskList;

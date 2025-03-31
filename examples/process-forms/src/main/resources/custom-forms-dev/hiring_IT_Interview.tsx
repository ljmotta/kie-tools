import React, { useCallback, useEffect, useState } from "react";
import { Checkbox, FormGroup, Card, CardBody, TextInput, Split, SplitItem, Button } from "@patternfly/react-core";
import { PlusCircleIcon, MinusCircleIcon } from "@patternfly/react-icons";
const Form__hiring_IT_Interview: React.FC<any> = (props: any) => {
  const [formApi, setFormApi] = useState<any>();
  const [approved, set__approved] = useState<boolean>(false);
  const [candidate__email, set__candidate__email] = useState<string>("");
  const [candidate__name, set__candidate__name] = useState<string>("");
  const [candidate__skills, set__candidate__skills] = useState<string[]>([]);
  const [offer__salary, set__offer__salary] = useState<number>();
  /* Utility function that fills the form with the data received from the kogito runtime */
  const setFormData = (data) => {
    if (!data) {
      return;
    }
    set__approved(data?.approved ?? false);
    set__candidate__email(data?.candidate?.email ?? "");
    set__candidate__name(data?.candidate?.name ?? "");
    set__candidate__skills(data?.candidate?.skills ?? []);
    set__offer__salary(data?.offer?.salary);
  };
  /* Utility function to generate the expected form output as a json object */
  const getFormData = useCallback(() => {
    const formData: any = {};
    formData.approved = approved;
    return formData;
  }, [approved]);
  /* Utility function to validate the form on the 'beforeSubmit' Lifecycle Hook */
  const validateForm = useCallback(() => {}, []);
  /* Utility function to perform actions on the on the 'afterSubmit' Lifecycle Hook */
  const afterSubmit = useCallback((result) => {}, []);
  useEffect(() => {
    if (formApi) {
      /*
        Form Lifecycle Hook that will be executed before the form is submitted.
        Throwing an error will stop the form submit. Usually should be used to validate the form.
      */
      formApi.beforeSubmit = () => validateForm();
      /*
        Form Lifecycle Hook that will be executed after the form is submitted.
        It will receive a response object containing the `type` flag indicating if the submit has been successful and `info` with extra information about the submit result.
      */
      formApi.afterSubmit = (result) => afterSubmit(result);
      /* Generates the expected form output object to be posted */
      formApi.getFormData = () => getFormData();
    }
  }, [getFormData, validateForm, afterSubmit]);
  useEffect(() => {
    /*
      Call to the Kogito console form engine. It will establish the connection with the console embeding the form
      and return an instance of FormAPI that will allow hook custom code into the form lifecycle.
      The `window.Form.openForm` call expects an object with the following entries:
        - onOpen: Callback that will be called after the connection with the console is established. The callback
        will receive the following arguments:
          - data: the data to be bound into the form
          - ctx: info about the context where the form is being displayed. This will contain information such as the form JSON Schema, process/task, user...
    */
    const api = window.Form.openForm({
      onOpen: (data, context) => {
        setFormData(data);
      },
    });
    setFormApi(api);
  }, []);
  return (
    <div className={"pf-c-form"}>
      <FormGroup fieldId="uniforms-000m-0001">
        <Checkbox
          isChecked={approved}
          isDisabled={false}
          id={"uniforms-000m-0001"}
          name={"approved"}
          label={"I approve this candidate!"}
          onChange={set__approved}
        />
      </FormGroup>
      <Card>
        <CardBody className="pf-c-form">
          <label>
            <b>Candidate</b>
          </label>
          <FormGroup fieldId={"uniforms-000m-0004"} label={"Email"} isRequired={false}>
            <TextInput
              name={"candidate.email"}
              id={"uniforms-000m-0004"}
              isDisabled={true}
              placeholder={""}
              type={"text"}
              value={candidate__email}
              onChange={set__candidate__email}
            />
          </FormGroup>
          <FormGroup fieldId={"uniforms-000m-0005"} label={"Name"} isRequired={false}>
            <TextInput
              name={"candidate.name"}
              id={"uniforms-000m-0005"}
              isDisabled={true}
              placeholder={""}
              type={"text"}
              value={candidate__name}
              onChange={set__candidate__name}
            />
          </FormGroup>
          <div>
            <Split hasGutter>
              <SplitItem>
                {"Skills" && (
                  <label className={"pf-c-form__label"}>
                    <span className={"pf-c-form__label-text"}>Skills</span>
                  </label>
                )}
              </SplitItem>
              <SplitItem isFilled />
              <SplitItem>
                <Button
                  name="$"
                  variant="plain"
                  style={{ paddingLeft: "0", paddingRight: "0" }}
                  disabled={true}
                  onClick={() => {
                    !true && set__candidate__skills((candidate__skills ?? []).concat([""]));
                  }}
                >
                  <PlusCircleIcon color="#0088ce" />
                </Button>
              </SplitItem>
            </Split>
            <div>
              {candidate__skills?.map((_, itemIndex) => (
                <div
                  key={itemIndex}
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ width: "100%", marginRight: "10px" }}>
                    <FormGroup fieldId={"uniforms-000m-0008"} label={""} isRequired={false}>
                      <TextInput
                        name={`candidate__skills.${itemIndex}`}
                        id={"uniforms-000m-0008"}
                        isDisabled={true}
                        placeholder={""}
                        type={"text"}
                        value={candidate__skills?.[itemIndex]}
                        onChange={(newValue) => {
                          set__candidate__skills((s) => {
                            const newState = [...s];
                            newState[itemIndex] = newValue;
                            return newState;
                          });
                        }}
                      />
                    </FormGroup>
                  </div>
                  <div>
                    <Button
                      disabled={true}
                      variant="plain"
                      style={{ paddingLeft: "0", paddingRight: "0" }}
                      onClick={() => {
                        const value = [...candidate__skills];
                        value.splice(itemIndex, 1);
                        !true && set__candidate__skills(value);
                      }}
                    >
                      <MinusCircleIcon color="#cc0000" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="pf-c-form">
          <label>
            <b>Offer</b>
          </label>
          <FormGroup fieldId={"uniforms-000m-000c"} label={"Salary"} isRequired={false}>
            <TextInput
              type={"number"}
              name={"offer.salary"}
              isDisabled={true}
              id={"uniforms-000m-000c"}
              placeholder={""}
              step={1}
              value={offer__salary}
              onChange={(newValue) => set__offer__salary(Number(newValue))}
            />
          </FormGroup>
        </CardBody>
      </Card>
    </div>
  );
};
export default Form__hiring_IT_Interview;

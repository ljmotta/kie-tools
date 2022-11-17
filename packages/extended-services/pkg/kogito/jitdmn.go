package kogito

type JitDmnWebSocketMethod int

const (
	Validate JitDmnWebSocketMethod = iota
	DmnResult
	Schema
)

func (m JitDmnWebSocketMethod) String() string {
	switch m {
	case Validate:
		return "validate"
	case DmnResult:
		return "dmnresult"
	case Schema:
		return "schema"
	}
	return "unkown"
}

type JitDmnWebSocketReceive struct {
	Method  JitDmnWebSocketMethod `json:"method"`
	Payload string                `json:"payload"`
}

type JitDmnWebSocketResponse struct {
	Method   JitDmnWebSocketMethod `json:"method"`
	Response string                `json:"response"`
	Status   int                   `json:"status"`
}

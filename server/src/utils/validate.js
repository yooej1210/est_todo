function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      console.log("VALIDATION ERROR:", result.error.issues);

      return res.status(400).json({
        message: "Validation Error",
        errors: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: mapZodIssue(i),
        })),
      });
    }

    req.validated = result.data;
    next();
  };
}


function hasNonAscii(value) {
  return /[^\x00-\x7F]/.test(value);
}

function mapZodIssue(issue) {
  if (issue.message && hasNonAscii(issue.message)) {
    return issue.message;
  }

  switch (issue.code) {
    case "invalid_type":
      if (issue.received === "undefined") {
        return "필수 입력입니다";
      }
      return "형식이 올바르지 않습니다";
    case "invalid_string":
      if (issue.validation === "email") {
        return "이메일 형식이 올바르지 않습니다";
      }
      return "형식이 올바르지 않습니다";
    case "too_small":
      if (issue.type === "string" && typeof issue.minimum === "number") {
        return `최소 ${issue.minimum}자 이상 입력해 주세요`;
      }
      return "입력값이 너무 짧습니다";
    case "too_big":
      if (issue.type === "string" && typeof issue.maximum === "number") {
        return `최대 ${issue.maximum}자까지 입력해 주세요`;
      }
      return "입력값이 너무 깁니다";
    case "invalid_enum_value":
      return "허용되지 않은 값입니다";
    case "custom":
      return issue.message || "입력값이 올바르지 않습니다";
    default:
      return issue.message || "입력값이 올바르지 않습니다";
  }
}


module.exports = { validate };

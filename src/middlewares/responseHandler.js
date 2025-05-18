export const successResponse = (
  res,
  data = [],
  message = "",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    message,
    ...data,
  });
};

export const errorResponse = (res, error = "", statusCode = 500) => {
  return res.status(statusCode).json({
    message: error,
  });
};

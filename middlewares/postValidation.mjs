export const validatePostData = (req, res, next) => {
  const postData = { ...req.body };

  // Input check
  if (!postData.title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  if (!postData.image) {
    return res.status(400).json({
      message: "Image is required",
    });
  }

  if (!postData.category_id) {
    return res.status(400).json({
      message: "Category_id is required",
    });
  }

  if (!postData.description) {
    return res.status(400).json({
      message: "Description is required",
    });
  }

  if (!postData.content) {
    return res.status(400).json({
      message: "Content is required",
    });
  }

  if (!postData.status_id) {
    return res.status(400).json({
      message: "Status_id is required",
    });
  }

  // Type check
  if (typeof postData.title !== "string") {
    return res.status(400).json({
      message: "Title must be a string",
    });
  }

  if (typeof postData.image !== "string") {
    return res.status(400).json({
      message: "Image must be a string",
    });
  }

  if (typeof postData.category_id !== "number") {
    return res.status(400).json({
      message: "Category_id must be a number",
    });
  }

  if (typeof postData.description !== "string") {
    return res.status(400).json({
      message: "Description must be a string",
    });
  }

  if (typeof postData.content !== "string") {
    return res.status(400).json({
      message: "Content must be a string",
    });
  }

  if (typeof postData.status_id !== "number") {
    return res.status(400).json({
      message: "Status_id must be a number",
    });
  }

  next();
};

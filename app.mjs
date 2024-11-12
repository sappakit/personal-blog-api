import express from "express";
import cors from "cors";
import { pool } from "./utils/db.mjs";
import { validatePostData } from "./middlewares/postValidation.mjs";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/profiles", (req, res) => {
  return res.json({
    data: {
      name: "john",
      age: 20,
    },
  });
});

// Get post
app.get("/posts", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 6));
    const offset = (page - 1) * limit;

    const category = req.query.category;
    const keyword = req.query.keyword;

    let sqlQuery = `
    FROM posts
    INNER JOIN categories ON posts.category_id = categories.id
    INNER JOIN statuses ON posts.status_id = statuses.id
  `;

    let postsQuery = `SELECT posts.id, posts.image, categories.name AS category, posts.title, posts.description, posts.date, posts.content, statuses.status, posts.likes_count ${sqlQuery}`;

    let conditions = [];
    let values = [];

    if (category) {
      conditions.push(`categories.name ILIKE $${values.length + 1}`);
      values.push(`%${category}%`);
    }

    if (keyword) {
      const keywordPlaceholder = `$${values.length + 1}`;
      conditions.push(
        `(posts.title ILIKE ${keywordPlaceholder} OR posts.description ILIKE ${keywordPlaceholder} OR posts.content ILIKE ${keywordPlaceholder})`
      );
      values.push(`%${keyword}%`);
    }

    if (conditions.length > 0) {
      postsQuery += " WHERE " + conditions.join(" AND ");
    }

    postsQuery += ` ORDER BY posts.date DESC LIMIT $${
      values.length + 1
    } OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const results = await pool.query(postsQuery, values);

    let countQuery = `SELECT COUNT(*) ${sqlQuery}`;
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
    }

    const countValues = values.slice(0, -2);

    const countResult = await pool.query(countQuery, countValues);
    const totalPosts = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalPosts / limit);

    const response = {
      totalPosts,
      totalPages,
      currentPage: page,
      limit,
      posts: results.rows,
    };

    if (page < totalPages) response.nextPage = page + 1;
    if (page > 1) response.previousPage = page - 1;

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server could not read post because database connection",
    });
  }
});

// Get post by id
app.get("/posts/:postId", async (req, res) => {
  const postIdFromClient = req.params.postId;
  let results;

  try {
    const sqlQuery = `
      SELECT posts.id, posts.image, categories.name AS category, posts.title, posts.description, posts.date, posts.content, statuses.status, posts.likes_count
      FROM posts
      INNER JOIN categories ON posts.category_id = categories.id
      INNER JOIN statuses ON posts.status_id = statuses.id
      WHERE posts.id = $1
    `;

    const values = [postIdFromClient];

    results = await pool.query(sqlQuery, values);

    if (!results.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested post",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not read post because database connection",
    });
  }

  return res.status(200).json({
    data: results.rows[0],
  });
});

// Post new posts
app.post("/posts", [validatePostData], async (req, res) => {
  try {
    const newPost = {
      ...req.body,
    };

    const query = `INSERT INTO posts (title, image, category_id, description, content, status_id)
    VALUES ($1, $2, $3, $4, $5, $6)`;

    const values = [
      newPost.title,
      newPost.image,
      newPost.category_id,
      newPost.description,
      newPost.content,
      newPost.status_id,
    ];

    await pool.query(query, values);
  } catch {
    return res.status(500).json({
      message: "Server could not create post because database connection",
    });
  }

  return res.status(201).json({
    message: "Created post sucessfully",
  });
});

// Update posts
app.put("/posts/:postId", [validatePostData], async (req, res) => {
  const postIdFromClient = req.params.postId;
  const updatedPost = { ...req.body, date: new Date() };

  try {
    const checkPostId = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postIdFromClient,
    ]);

    if (!checkPostId.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested post to update",
      });
    }

    const updateQuery =
      "UPDATE posts SET title = $2, image = $3, category_id = $4, description = $5, content = $6, status_id = $7, date = $8 WHERE id = $1";

    const value = [
      postIdFromClient,
      updatedPost.title,
      updatedPost.image,
      updatedPost.category_id,
      updatedPost.description,
      updatedPost.content,
      updatedPost.status_id,
      updatedPost.date,
    ];

    await pool.query(updateQuery, value);
  } catch {
    return res.status(500).json({
      message: "Server could not update post because database connection",
    });
  }

  return res.status(200).json({
    message: "Updated post sucessfully",
  });
});

// Delete posts
app.delete("/posts/:postId", async (req, res) => {
  try {
    const postIdFromClient = req.params.postId;

    const checkPostId = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postIdFromClient,
    ]);

    if (!checkPostId.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested post to delete",
      });
    }

    await pool.query("DELETE FROM posts WHERE id = $1", [postIdFromClient]);
  } catch {
    return res.status(500).json({
      message: "Server could not delete post because database connection",
    });
  }

  return res.status(200).json({
    message: "Deleted post sucessfully",
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

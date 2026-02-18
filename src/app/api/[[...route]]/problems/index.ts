import { Hono } from "hono";
import { createAnswer } from "./createAnswer";
import { createProblem } from "./createProblem";
import { deleteAnswer } from "./deleteAnswer";
import { deleteProblem } from "./deleteProblem";
import { getAnswer } from "./getAnswer";
import { getAnswers } from "./getAnswers";
import { getProblem } from "./getProblem";
import { getProblemList } from "./getProblemList";
import { submitProblem } from "./submitProblem";
import { updateAnswer } from "./updateAnswer";
import { updateProblem } from "./updateProblem";

// BaseAPIPath is /api/problems
export const problems = new Hono()
  .get("/", ...getProblemList)
  .post("/", ...createProblem)
  .get("/:problem_id", ...getProblem)
  .patch("/:problem_id", ...updateProblem)
  .delete("/:problem_id", ...deleteProblem)
  .post("/:problem_id/submit", ...submitProblem)
  .get("/:problem_id/answers", ...getAnswers)
  .post("/:problem_id/answers", ...createAnswer)
  .get("/answers/:answer_id", ...getAnswer)
  .delete("/answers/:answer_id", ...deleteAnswer)
  .patch("/answers/:answer_id", ...updateAnswer);

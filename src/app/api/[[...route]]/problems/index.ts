import { Hono } from "hono";
import { createAnswer } from "./createAnswer";
import { createProblem } from "./createProblem";
import { deleteProblem } from "./deleteProblem";
import { getAnswer } from "./getAnswer";
import { getAnswers } from "./getAnswers";
import { getProblem } from "./getProblem";
import { getProblemList } from "./getProblemList";
import { submitProblem } from "./submitProblem";
import { updateProblem } from "./updateProblem";

// BaseAPIPath is /api/courses/problems
export const problems = new Hono()
  .get("/", ...getProblemList)
  .post("/", ...createProblem)
  .get("/:problem_id", ...getProblem)
  .patch("/:problem_id", ...updateProblem)
  .delete("/:problem_id", ...deleteProblem)
  .post("/:problem_id/submit", ...submitProblem)
  .get("/:problem_id/answers", ...getAnswers)
  .post("/:problem_id/answers", ...createAnswer)
  .get("/answers/:answer_id", ...getAnswer);

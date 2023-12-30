import express from "express";

import users from "./users";
import auth from "./auth";
import materialGrades from "./materials/materialGrades";
import materialGroups from "./materials/materialGroups";
import materialNames from "./materials/materialNames";
import materialProviders from "./materials/materialProviders";
import partNames from "./parts/partNames";
import partGroups from "./parts/partGroups";
import partsGeneralIds from "./parts/partsGeneralIds";
import partProviders from "./parts/partProviders";
import getAll from "./getAll";
const router = express.Router();

export default (): express.Router => {
  users(router);
  auth(router);
  materialGrades(router);
  materialGroups(router);
  materialNames(router);
  materialProviders(router);
  partNames(router);
  partGroups(router);
  partsGeneralIds(router);
  partProviders(router);
  getAll(router);

  return router;
};

import { type JobApp } from "./JobApp";

export interface UserInfo {
  id: string;
  email: string;
  createdAt: string;
  jobApps?: JobApp[];
}

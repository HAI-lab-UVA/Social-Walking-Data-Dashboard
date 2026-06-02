import { DocumentData } from "firebase/firestore";

export class SWUser {
  id: string;
  group: string;
  firstName: string;
  lastName: string;
  constructor(id: string, group: string, firstName: string, lastName: string) {
    this.id = id;
    this.group = group;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

export const SWUserConverter = {
  fromFirestore: (data: DocumentData) => {
    return new SWUser(data.id, data.group, data.firstName, data.lastName);
  },
};

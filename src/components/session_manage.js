import * as Auth   from './auth';

export default class SessionManager {
  static myInstance = null;
  // userToken = '';
  //   constructor() {
  // }
  static shared() {
    if (SessionManager.myInstance == null) {
        SessionManager.myInstance = new SessionManager();
    }

    return this.myInstance;
  }
  getAuthorizationHeader = () => {
    return {
      headers: {
        'Authorization': 'Bearer ' + Auth.getUserToken(),
        'Content-Type': 'application/json',
      }
    };
  };
}

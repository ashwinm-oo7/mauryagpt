let accessToken = null;

export const authStore = {
  setAccessToken: (token) => {
    accessToken = token;
  },
  getAccessToken: () => accessToken,
  clear: () => {
    accessToken = null;
  },
};

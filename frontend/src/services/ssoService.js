const ssoService = {
  // Return empty array of providers
  getProviders: async () => {
    return { data: [] };
  },

  // Return a placeholder URL
  initiateSSO: async (provider) => {
    console.warn("SSO functionality has been removed");
    return { data: { authUrl: "#" } };
  },

  // Return mock authentication response
  completeSSO: async (provider, code, state) => {
    console.warn("SSO functionality has been removed");
    return { data: { message: "SSO functionality has been removed" } };
  },

  // Return success for link operation
  linkProvider: async (token, provider, code) => {
    console.warn("SSO functionality has been removed");
    return { data: { success: false } };
  },

  // Return success for unlink operation
  unlinkProvider: async (token, provider) => {
    console.warn("SSO functionality has been removed");
    return { data: { success: false } };
  },

  // Return empty array of linked providers
  getLinkedProviders: async (token) => {
    return { data: [] };
  },
};

export default ssoService;

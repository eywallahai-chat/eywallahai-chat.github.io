exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Eywallah, Netlify Function çalıştı!",
      timestamp: new Date().toISOString()
    }),
  };
};

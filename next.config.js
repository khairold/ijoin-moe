module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/personal/home/fibre-broadband/start-here',
        permanent: false,
      },
    ]
  },
}

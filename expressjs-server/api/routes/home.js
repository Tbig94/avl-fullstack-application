const router = require('express').Router();

router.get('/', (req, res) => {
  /*
    #swagger.auto = false
    #swagger.tags = ['Home']
    #swagger.path = '/'
    #swagger.method = 'get'
    #swagger.produces = ['application/json']
    #swagger.consumes = ['application/json']
    #swagger.responses[200] = {
      description: 'Success'
    }
  */
  res.json({ message: `Home Page` });
});

module.exports = router;

exports.getHome = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    
    res.render('home/homepage', {
      path: '/homepage',
      pageTitle: 'homepage',
      errorMessage: message
    });
  };

  exports.getIndex = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    
    res.render('chat/index', {
      path: '/index',
      pageTitle: 'index',
      errorMessage: message
    });
  };
  
  exports.getChat = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    
    res.render('chat/chat', {
      path: '/chat',
      pageTitle: 'chat',
      errorMessage: message
    });
  };
  
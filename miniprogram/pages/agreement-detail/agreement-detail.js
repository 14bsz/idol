const AGREEMENT_CONTENT_MAP = {
  user: {
    title: '用户服务协议',
    updatedAt: '2026年06月09日',
    intro: '欢迎使用爱豆时光日记。在使用本小程序前，请认真阅读本协议。您在充分阅读并自主勾选同意后，方可继续登录和使用相关服务。',
    sections: [
      {
        heading: '一、服务内容',
        paragraphs: [
          '爱豆时光日记为用户提供追星日记记录、收藏整理、时间轴回顾、纪念日管理等内容服务。',
          '我们会持续优化产品能力，具体功能以小程序内实际展示为准。'
        ]
      },
      {
        heading: '二、用户使用规范',
        paragraphs: [
          '您应确保账号使用行为合法合规，不得利用本服务发布违法、侵权、低俗或其他不当内容。',
          '您应妥善保管账号信息，不得冒用他人身份或恶意扰乱平台正常运行。'
        ]
      },
      {
        heading: '三、内容管理',
        paragraphs: [
          '您发布或上传的文字、图片等内容，应保证拥有合法权利或已获得授权。',
          '如您上传的内容存在违规风险，我们有权依据法律法规及平台规范进行处理。'
        ]
      },
      {
        heading: '四、服务变更与中止',
        paragraphs: [
          '因系统维护、升级或不可抗力等原因，我们可能对服务进行调整、中断或终止。',
          '如出现影响您正常使用的重要变更，我们会通过合理方式进行提示。'
        ]
      },
      {
        heading: '五、协议生效',
        paragraphs: [
          '本协议自您自主勾选同意并使用本小程序服务时生效。',
          '如您不同意本协议内容，请勿继续登录或使用相关服务。'
        ]
      }
    ]
  },
  privacy: {
    title: '隐私政策',
    updatedAt: '2026年06月09日',
    intro: '我们重视您的个人信息和隐私安全。在您阅读本政策并自主勾选同意前，我们不会以默认勾选、强制同意等方式获取您的授权。',
    sections: [
      {
        heading: '一、我们收集的信息',
        paragraphs: [
          '为完成微信登录，我们会在您主动登录后获取登录凭证，并向服务端换取账号标识信息。',
          '在您主动完善资料、记录日记、上传图片、添加收藏或设置纪念日时，我们会处理您主动提交的昵称、头像、文本、图片及提醒配置等信息。'
        ]
      },
      {
        heading: '二、信息使用目的',
        paragraphs: [
          '用于完成身份校验、保存追星记录、展示收藏内容、生成时间轴与纪念日提醒，以及保障服务正常运行。',
          '我们不会超出上述目的使用您的个人信息。'
        ]
      },
      {
        heading: '三、信息存储与保护',
        paragraphs: [
          '我们会采取合理的安全措施保护您的信息，防止数据被未经授权访问、泄露、篡改或丢失。',
          '仅在实现产品功能所必需的期限内保存您的相关信息。'
        ]
      },
      {
        heading: '四、您的权利',
        paragraphs: [
          '您可以在小程序内查看、修改或删除自己主动填写、上传的部分内容。',
          '如您希望注销账号或对隐私处理有疑问，可通过产品内提供的联系渠道与我们沟通。'
        ]
      },
      {
        heading: '五、政策更新',
        paragraphs: [
          '当隐私政策发生重要变更时，我们会通过合理方式提示您重新阅读。',
          '更新后的隐私政策会在本页面展示最新版本及更新时间。'
        ]
      }
    ]
  }
};

Page({
  data: {
    title: '协议详情',
    updatedAt: '',
    intro: '',
    sections: []
  },

  onLoad(options) {
    const type = options.type === 'privacy' ? 'privacy' : 'user';
    const content = AGREEMENT_CONTENT_MAP[type];

    wx.setNavigationBarTitle({
      title: content.title
    });

    this.setData({
      title: content.title,
      updatedAt: content.updatedAt,
      intro: content.intro,
      sections: content.sections
    });
  }
});

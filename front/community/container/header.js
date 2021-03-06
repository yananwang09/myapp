import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../actions/header';

class Header extends React.Component {
  constructor(props) {
    super(props);
    // expandStatus expand状态，false收起，true展开
    this.state = {
      expandStatus: false
    };
  }

  componentDidMount() {
    let _this = this;
    this.props.actions.getUserBase();
    window.addEventListener('click', (e) => {
      if (e.target.id != 'header') {
        _this.setState({
          expandStatus: false
        });
      }
    });
  }

  logout() {
    this.props.actions.logout();
  }

  expand() {
    this.setState({
      expandStatus: !this.state.expandStatus
    });
  }

  pushLogin(type) {
    localStorage.setItem('login', type);
  }

  scrollTop() {
    scrollTo(0, 0);
  }

  logout() {
    this.props.actions.logout();
  }

  render() {
    return (
      <div className = 'header'>
        <div className = 'body'>

          {/* logo */}
          <Link
            className = 'logo'
            to = '/community/home'
            onClick = { () => { this.scrollTop(); } } />

          {/* 预留区 */}
          <div className = 'group'>
            <Link
              className = 'home'
              to = '/community/home'
              onClick = { () => { this.scrollTop(); } }>
              <div>首页</div>
            </Link>
          </div>

          {/* 写文章 */}
          {
            this.props.header.status == 1 &&
            <a
              className = 'write'
              href = '/login'
              onClick = { () => { this.scrollTop(); } }>
              <div className = 'icon'></div>
              <span>写文章</span>
            </a>
          }
          {
            this.props.header.status == 2 &&
            <Link
              className = 'write'
              to = '/community/addArticle'
              onClick = { () => { this.scrollTop(); } }>
              <div className = 'icon'></div>
              <span>写文章</span>
            </Link>
          }

          {/* 登录相关 */}
          <div className = 'user'>
            {
              this.props.header.status == 1 &&
              <React.Fragment>
                <div
                  className = 'login'
                  onClick = { () => { this.pushLogin('login'); } }>
                  <a href = '/login'>登录</a>
                </div>
                <div
                  className = 'register'
                  onClick = { () => { this.pushLogin('register'); } }>
                  <a href = '/login'>注册</a>
                </div>
              </React.Fragment>
            }
            {
              this.props.header.status == 2 &&
              <React.Fragment>
                <img
                  id = 'header'
                  className = 'img'
                  src = {
                    this.props.header.user.head_img != null
                    ? this.props.header.user.head_img
                    : '/images/community/header_default_avatar.png'
                  }
                  onClick = { () => { this.expand(); } } />
              </React.Fragment>
            }

            {
              this.state.expandStatus &&
              <div className = 'expand'>
                <Link
                  to = { '/community/personal/' + this.props.header.user.id }
                  onClick = { () => { this.scrollTop(); } }>
                  <div className = 'item'>我的主页</div>
                </Link>
                <Link
                  to = { '/community/setting/' + this.props.header.user.id }
                  onClick = { () => { this.scrollTop(); } }>
                  <div className = 'item'>设置</div>
                </Link>
                <a
                  href = '/login'
                  onClick = { () => { this.logout(); } }>
                  <div className = 'item'>退出</div>
                </a>

              </div>
            }

          </div>

        </div>
      </div>
    );
  }
}

const mapStateToProps = (store) => {
  return {
    header: store.header
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

import React, {Component} from 'react'
import { trls } from './translate';
import  { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as Auth from '../components/auth';
import $ from 'jquery';

const mapStateToProps = state => ({ 
    ...state.auth,
});
const mapDispatchToProps = (dispatch) => ({

});

class Sidebar extends Component {
    constructor(props){
        super(props);
        this.state = {
            userInfo: Auth.getUserInfo(),
            subFlag: false
        }
    }

    componentDidMount() {
       
    }

    changeItem = (mode) => {
        if(mode==="sub"){
            $(".submenu-collapse ").removeClass("show");
            // this.setState({subFlag: false});
        }else{
            // this.setState({subFlag: true});
        }
        this.setState({flag:1})
    }

    render () {
        const{ userInfo, subFlag } = this.state;
        return (
            <div className = "side-bar__div">
                <aside className="sidebar">
                    <a href="/" className="sidebar__logo"><img src={require('../assets/images/appmakerz.svg')} alt="appzmakerz"></img></a>
                    <nav className="menu">
                        <ul className="nav flex-column flex-nowrap overflow-hidden menu__list">
                            <li id="0" className="nav-item" onClick={()=>this.changeItem('sub')}>
                                <Link to="./dashboard" className={window.location.pathname === "/dashboard" ? 'menu__link menu__link--active' : 'menu__link menu__link'}>
                                    <div className="menu__link-div menu__link-div--active"></div>
                                    <span className="menu__link-img-wrap">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path className="menu-link__icon menu-link__icon--active" d="M8 0C3.589 0 0 3.589 0 8C0 12.411 3.589 16 8 16C12.411 16 16 12.411 16 8C16 3.589 12.411 0 8 0ZM13.91 9H8.677L6.929 4.628L5.071 5.372L6.523 9H2.09C2.0321 8.66977 2.002 8.33526 2 8C2 4.691 4.691 2 8 2C11.309 2 14 4.691 14 8C14 8.341 13.965 8.674 13.91 9Z"/>
                                        </svg>
                                    </span>
                                    <span>{trls("Dashboard")}</span>
                                </Link>
                            </li>
                            <li id="1" className="nav-item" onClick={()=>this.changeItem('sub')}>
                                <Link to={'/product'} className={window.location.pathname === "/product" || window.location.pathname === "/product-detail" ? 'menu__link menu__link--active' : 'menu__link menu__link'}>
                                    <div className="menu__link-div menu__link-div--active"></div>
                                    <span className="menu__link-img-wrap">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path className="menu-link__icon menu-link__icon--active" d="M13 6H10V10L8 9L6 10V6H3C2.4 6 2 6.4 2 7V14C2 14.6 2.4 15 3 15H13C13.6 15 14 14.6 14 14V7C14 6.4 13.6 6 13 6Z" fill="#585858"/>
                                            <path className="menu-link__icon menu-link__icon--active" d="M0 1H16V5H0V1Z" fill="#585858"/>
                                        </svg>
                                    </span>
                                    <span>{trls("Products")}</span>
                                </Link>
                            </li>
                            {userInfo.roles!=="Orderverwerker" && (
                                <li id="2" className="nav-item" onClick={()=>this.changeItem('sub')}>
                                    <Link to={'/user'} className={window.location.pathname === "/user" || window.location.pathname === "/user-detail" ? 'menu__link menu__link--active' : 'menu__link menu__link'}>
                                        <div className="menu__link-div menu__link-div--active"></div>
                                        <span className="menu__link-img-wrap">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path className="menu-link__icon menu-link__icon--active" d="M15.2753 10.2944L13.0873 9.66936C12.9105 9.6188 12.751 9.52046 12.6265 9.38514C12.5019 9.24982 12.4171 9.08277 12.3813 8.90237L12.2473 8.22737C12.7699 7.98855 13.2129 7.6047 13.5236 7.12146C13.8344 6.63822 13.9998 6.0759 14.0003 5.50137V4.12737C14.0124 3.33181 13.7166 2.56235 13.1747 1.9798C12.6328 1.39725 11.8867 1.04668 11.0923 1.00137C10.4993 0.983473 9.91436 1.14179 9.41135 1.45631C8.90834 1.77083 8.50987 2.22742 8.26631 2.76837C8.74336 3.46264 8.99923 4.28499 9.00031 5.12737V6.50137C8.99852 6.86514 8.94636 7.22691 8.84531 7.57636C9.10455 7.84831 9.41255 8.06914 9.75331 8.22737L9.61931 8.90136C9.58355 9.08177 9.49872 9.24882 9.37416 9.38414C9.24961 9.51946 9.09014 9.6178 8.91331 9.66836L8.07031 9.90936L9.55031 10.3324C9.96751 10.4529 10.3344 10.7055 10.5958 11.0522C10.8573 11.3989 10.9992 11.8211 11.0003 12.2554V14.5014C10.9987 14.6721 10.9675 14.8412 10.9083 15.0014H15.5003C15.6329 15.0014 15.7601 14.9487 15.8539 14.8549C15.9476 14.7612 16.0003 14.634 16.0003 14.5014V11.2554C16.0002 11.0382 15.9294 10.8269 15.7986 10.6536C15.6678 10.4802 15.4841 10.3541 15.2753 10.2944Z" fill="#585858"/>
                                                <path className="menu-link__icon menu-link__icon--active" d="M9.275 11.2944L7.087 10.6694C6.91004 10.6187 6.75049 10.5202 6.62592 10.3847C6.50135 10.2492 6.4166 10.0819 6.381 9.90135L6.247 9.22635C6.7694 8.98761 7.21228 8.60391 7.52303 8.12087C7.83377 7.63782 7.99932 7.07572 8 6.50135V5.12735C8.01213 4.3318 7.71632 3.56234 7.17439 2.97978C6.63246 2.39723 5.88636 2.04666 5.092 2.00135C4.69036 1.98903 4.29034 2.05752 3.91568 2.20275C3.54101 2.34799 3.19935 2.56702 2.91095 2.84683C2.62256 3.12664 2.39332 3.46154 2.23683 3.83164C2.08035 4.20175 1.99981 4.59952 2 5.00135V6.50135C2.00049 7.07589 2.16595 7.6382 2.4767 8.12145C2.78746 8.60469 3.23045 8.98853 3.753 9.22735L3.619 9.90135C3.58323 10.0818 3.49841 10.2488 3.37385 10.3841C3.24929 10.5194 3.08983 10.6178 2.913 10.6684L0.725 11.2934C0.516025 11.3531 0.332214 11.4794 0.201397 11.6529C0.0705796 11.8265 -0.000120636 12.038 1.54521e-07 12.2554V14.5014C1.54521e-07 14.634 0.0526786 14.7611 0.146447 14.8549C0.240215 14.9487 0.367392 15.0014 0.5 15.0014H9.5C9.63261 15.0014 9.75979 14.9487 9.85355 14.8549C9.94732 14.7611 10 14.634 10 14.5014V12.2554C9.9999 12.0382 9.9291 11.8269 9.7983 11.6535C9.6675 11.4802 9.48381 11.3541 9.275 11.2944Z" fill="#585858"/>
                                            </svg>
                                        </span>
                                        <span>{trls("User")}</span>
                                    </Link>
                                </li>
                            )}
                            <li id="3" className="nav-item" onClick={()=>this.changeItem('sub')}>
                                <Link to={'/sales-order'} className={window.location.pathname === "/sales-order" || window.location.pathname === "/sales-order-detail" ? 'menu__link menu__link--active' : 'menu__link menu__link'} >
                                    <div className="menu__link-div menu__link-div--active"></div>
                                    <span className="menu__link-img-wrap">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path className="menu-link__icon menu-link__icon--active" d="M14 5H12V4C12 1.8 10.2 0 8 0C5.8 0 4 1.8 4 4V5H2C1.4 5 1 5.4 1 6V15C1 15.6 1.4 16 2 16H14C14.6 16 15 15.6 15 15V6C15 5.4 14.6 5 14 5ZM6 4C6 2.9 6.9 2 8 2C9.1 2 10 2.9 10 4V5H6V4Z" fill="#585858"/>
                                        </svg>
                                    </span>
                                    <span>{trls("Sales_Order")}</span>
                                </Link>
                            </li>
                            <li id="4" className="nav-item" onClick={()=>this.changeItem('sub')}>
                                <Link to={'/purchase-order'} className={window.location.pathname === "/purchase-order" || window.location.pathname === "/purchase-order-detail" ? 'menu__link menu__link--active' : 'menu__link menu__link'} >
                                    <div className="menu__link-div menu__link-div--active"></div>
                                    <span className="menu__link-img-wrap">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path className="menu-link__icon menu-link__icon--active" d="M15.7 7.3L8.7 0.3C8.5 0.1 8.3 0 8 0H3C2.7 0 2.5 0.1 2.3 0.3L0.3 2.3C0.1 2.5 0 2.7 0 3V8C0 8.3 0.1 8.5 0.3 8.7L7.3 15.7C7.5 15.9 7.7 16 8 16C8.3 16 8.5 15.9 8.7 15.7L15.7 8.7C16.1 8.3 16.1 7.7 15.7 7.3ZM4 5C3.4 5 3 4.6 3 4C3 3.4 3.4 3 4 3C4.6 3 5 3.4 5 4C5 4.6 4.6 5 4 5Z" fill="#585858"/>
                                        </svg>
                                    </span>
                                    <span>{trls("Purchase_Order")}</span>
                                </Link>
                            </li>
                            <li id="5" className="nav-item" onClick={()=>this.changeItem('sub')}>
                                <Link to={'/task-overview'} className={window.location.pathname === "/task-overview" ? 'menu__link menu__link--active' : 'menu__link menu__link'} >
                                    <div className="menu__link-div menu__link-div--active"></div>
                                    <span className="menu__link-img-wrap">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path className="menu-link__icon menu-link__icon--active" d="M15 0H7C6.4 0 6 0.4 6 1V3C6 3.6 6.4 4 7 4H15C15.6 4 16 3.6 16 3V1C16 0.4 15.6 0 15 0Z" fill="#585858"/>
                                            <path className="menu-link__icon menu-link__icon--active" d="M15 6H7C6.4 6 6 6.4 6 7V9C6 9.6 6.4 10 7 10H15C15.6 10 16 9.6 16 9V7C16 6.4 15.6 6 15 6Z" fill="#585858"/>
                                            <path className="menu-link__icon menu-link__icon--active" d="M15 12H7C6.4 12 6 12.4 6 13V15C6 15.6 6.4 16 7 16H15C15.6 16 16 15.6 16 15V13C16 12.4 15.6 12 15 12Z" fill="#585858"/>
                                            <path className="menu-link__icon menu-link__icon--active" d="M3 0H1C0.4 0 0 0.4 0 1V3C0 3.6 0.4 4 1 4H3C3.6 4 4 3.6 4 3V1C4 0.4 3.6 0 3 0Z" fill="#585858"/>
                                            <path className="menu-link__icon menu-link__icon--active" d="M3 6H1C0.4 6 0 6.4 0 7V9C0 9.6 0.4 10 1 10H3C3.6 10 4 9.6 4 9V7C4 6.4 3.6 6 3 6Z" fill="#585858"/>
                                            <path className="menu-link__icon menu-link__icon--active" d="M3 12H1C0.4 12 0 12.4 0 13V15C0 15.6 0.4 16 1 16H3C3.6 16 4 15.6 4 15V13C4 12.4 3.6 12 3 12Z" fill="#585858"/>
                                        </svg>
                                    </span>
                                    <span>{trls("Task")}</span>
                                </Link>
                            </li>
                            <li id="6" className="nav-item" onClick={()=>this.changeItem('sub')}>
                                <Link to={'/quality-overview'} className={window.location.pathname === "/quality-overview" ? 'menu__link menu__link--active' : 'menu__link menu__link'} >
                                    <div className="menu__link-div menu__link-div--active"></div>
                                    <span className="menu__link-img-wrap">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path className="menu-link__icon menu-link__icon--active" d="M14 0H2C1.4 0 1 0.4 1 1V16L4 14L6 16L8 14L10 16L12 14L15 16V1C15 0.4 14.6 0 14 0ZM12 10H4V8H12V10ZM12 6H4V4H12V6Z" fill="#585858"/>
                                        </svg>
                                    </span>
                                    <span>{trls("Invoicing")}</span>
                                </Link>
                            </li>
                            <li id="7" className="nav-item" onClick={()=>this.changeItem('sub')}>
                                <Link to={'/demurrage'} className={window.location.pathname === "/demurrage" ? 'menu__link menu__link--active' : 'menu__link menu__link'} >
                                    <div className="menu__link-div menu__link-div--active"></div>
                                    <span className="menu__link-img-wrap">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path className="menu-link__icon menu-link__icon--active" d="M15 4H4C3.4 4 3 3.6 3 3V1C3 0.4 3.4 0 4 0H15C15.6 0 16 0.4 16 1V3C16 3.6 15.6 4 15 4Z" fill="#585858"/>
                                            <path className="menu-link__icon menu-link__icon--active" d="M12 10H1C0.4 10 0 9.6 0 9V7C0 6.4 0.4 6 1 6H12C12.6 6 13 6.4 13 7V9C13 9.6 12.6 10 12 10Z" fill="#585858"/>
                                            <path className="menu-link__icon menu-link__icon--active" d="M15 16H4C3.4 16 3 15.6 3 15V13C3 12.4 3.4 12 4 12H15C15.6 12 16 12.4 16 13V15C16 15.6 15.6 16 15 16Z" fill="#585858"/>
                                        </svg>
                                    </span>
                                    <span>{trls("Demurrage")}</span>
                                </Link>
                            </li>
                            <li id="8" className="nav-item">
                                <div className={["/month-end"].indexOf(window.location.pathname)!==-1 || subFlag ? 'sidebar-submenu-div menu__link menu__link--active' : 'sidebar-submenu-div menu__link menu__link'} data-toggle="collapse" data-target="#submenu1" onClick={()=>this.changeItem('')}>
                                    <div className="menu__link-div menu__link-div--active"></div>
                                    <span className="menu__link-img-wrap">
                                        <i className="fas fa-table"></i>
                                    </span>
                                    <span>{trls("Reports")}</span>
                                </div>
                                <div className={["/month-end"].indexOf(window.location.pathname)!==-1 ? "submenu-collapse collapse show" : "submenu-collapse collapse"} id="submenu1" aria-expanded="false">
                                    <ul className="flex-column pl-2 nav">
                                        <li className="nav-item" onClick={()=>this.changeItem('')}>
                                            <Link to={'/month-end'} className={window.location.pathname === "/month-end" ? 'menu__link menu__link--active' : 'menu__link menu__link'}>
                                                <span className="menu__link-img-wrap sidebar-submenu_span">
                                                    <i className="fas fa-circle"></i>
                                                </span>
                                                <span>{trls("Month End")}</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </nav>
                </aside>
            </div>
        )
    };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);

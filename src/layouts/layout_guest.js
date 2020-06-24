import React, {Component} from 'react'
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import User from '../pages/User/user_register';
import Product from '../pages/Product/product';
import Productdetail from '../pages/Product/product_detail';
import Salesorderdetail from '../pages/Sales/selesorder_detail';
import Salesorder from '../pages/Sales/sales_order';
import Purchaseorder from '../pages/Purchase/purchase_order';
import Purchaseorderdetail from '../pages/Purchase/purchaseorder_detail';
import Taskoverview from '../pages/Task/task_overview';
import Qualityoverview from '../pages/Quality/quality_overview';
import Demurrage from '../pages/Demurrage/demurrage_manage';
import Monthend from '../pages/Monthend/monthend_manage';
import Dashboard from '../pages/Dashboard/dashboard_manage';
import { Switch,Router, Route } from 'react-router-dom';
import history from '../history';
import { connect } from 'react-redux';
import * as Auth from '../components/auth';
window.localStorage.setItem('AWT', true);

const mapStateToProps = state => ({ 
  ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({
  
});
class Layout extends Component {
  constructor(props){
    super(props);
    this.state = {
        userInfo: Auth.getUserInfo()
    }
  }
    render () {
      const { userInfo } = this.state;
      return (
          <Row style={{height:"100%", display: "flex"}}>
            <Sidebar/>
            <Col style={{paddingLeft: 0, paddingRight: 0, width: "75%"}}>
            <Header/>
                <Router history={history}>
                  <Switch>
                    <Route path="/dashboard" component={Dashboard}/>
                    {userInfo.roles!=="Orderverwerker" && (
                      <Route path="/user" component={User}/>
                    )}
                    <Route path="/product" component={Product}/>
                    <Route path="/product-detail" component={Productdetail}/>
                    <Route path="/sales-order" component={Salesorder} />
                    <Route path="/sales-order-detail" component={Salesorderdetail}/>
                    <Route path="/purchase-order" component={Purchaseorder}/>
                    <Route path="/purchase-order-detail" component={Purchaseorderdetail}/>
                    <Route path="/task-overview" component={Taskoverview}/>
                    <Route path="/quality-overview" component={Qualityoverview}/>
                    <Route path="/demurrage" component={Demurrage}/>
                    <Route path="/month-end" component={Monthend}/>
                  </Switch>
                </Router>
            </Col>
            <div className="fade-display"></div>
          </Row>
      )
    };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Layout);

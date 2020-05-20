import React, {Component} from 'react'
import $ from 'jquery';
import { Form, Row, Col } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { trls } from '../../components/translate';
import { connect } from 'react-redux';
import { BallBeat } from 'react-pure-loaders';
import 'datatables.net';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import * as Common from '../../components/common';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import * as authAction  from '../../actions/authAction';
import Productform from './product_form'
import Productdetail from './product_detail';
import Filtercomponent from '../../components/filtercomponent';
import Contextmenu from '../../components/contextmenu';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
  blankDispatch: () =>
        dispatch(authAction.blankdispatch()),
});

class Product extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            token: "",
            productData: [],
            Supplier: [],
            Producttype: [],
            Customer: [],
            Salesunit: [],
            Productgroup: [],
            slideFormFlag: false,
            slideproductDetailFlag: false,
            copyProduct: [],
            copyFlag: 1,
            productId: '',
            originFilterData: [],
            filterFlag: false,
            filterColunm: [
              {"label": 'Productcode', "value": "Productcode", "type": 'text', "show": true},
              {"label": 'Supplier', "value": "Supplier", "type": 'text', "show": true},
              {"label": 'Product', "value": "Product", "type": 'text', "show": true},
              {"label": 'Customer', "value": "Customer", "type": 'text', "show": true},
              {"label": 'Product_Name', "value": "Product", "type": 'text', "show": true},
              {"label": 'Sales_Price', "value": "SalesPrice", "type": 'text', "show": true},
              {"label": 'Purchase_Price', "value": "PurchasePrice", "type": 'text', "show": true},
              {"label": 'Sales_Unit', "value": "SalesUnit", "type": 'text', "show": true},
              {"label": 'Purchase_Unit', "value": "PurchaseUnit", "type": 'text', "show": true},
              {"label": 'Kilogram', "value": "Kilogram", "type": 'text', "show": true},
              {"label": 'Copy_Product', "value": "copyproduct", "type": 'text', "show": true}
          ],
          filterData: []
        };
    }

    componentDidMount() {
      this._isMounted = true;
      this.getProductData();
      this.getSupplierList();
      this.getProducttype();
      this.getCustomer();
      this.getProductGroup();
      this.getUnitData();
      this.getUserData();
      this.setFilterData();
    }

    getUserData = () => {
      var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetUserData, headers)
        .then(result => {
          let userData=result.data;
          let optionarray = [];
          if(userData){
              userData.map((data, index) => {
                  if(data.IsActive){
                      data.key = data.Id;
                      data.value = data.Email
                      optionarray.push(data);
                  }
                return userData;
              })
          }
          this.setState({approve_user:optionarray})
        });
    }

    getProductData = (data) =>{
      this.setState({loading:true})
      var headers = SessionManager.shared().getAuthorizationHeader();
      Axios.get(API.GetProductData, headers)
      .then(result => {
        if(this._isMounted){
          if(!data){
              this.setState({productData: result.data.Items, originFilterData: result.data.Items});
          }else{
              this.setState({productData: data});
          }
          this.setState({loading:false})
          $('.fitler').on( 'keyup', function () {
              table.search( this.value ).draw();
          } );
          $('#project_table').dataTable().fnDestroy();
          var table = $('#project_table').DataTable(
            {
              "language": {
                  "lengthMenu": trls("Show")+" _MENU_ "+trls("Result_on_page"),
                  "zeroRecords": "Nothing found - sorry",
                  "info": trls("Show_page")+" _PAGE_ "+trls('Results_of')+" _PAGES_",
                  "infoEmpty": "No records available",
                  "infoFiltered": "(filtered from _MAX_ total records)",
                  "search": trls('Search'),
                  "paginate": {
                    "previous": trls('Previous'),
                    "next": trls('Next')
                  }
              },
                "dom": 't<"bottom-datatable" lip>'
            }
            );
          }
      });
    }

    getSupplierList = () =>{
      var headers = SessionManager.shared().getAuthorizationHeader();
      Axios.get(API.GetSupplierList, headers)
      .then(result => {
        if(this._isMounted){
          this.setState({Supplier: result.data.Items})
        }
      });
    }

    getUnitData = () =>{
      var headers = SessionManager.shared().getAuthorizationHeader();
      Axios.get(API.GetUnitData, headers)
      .then(result => {
        if(this._isMounted){
          this.setState({purchase_unit: result.data.Items})
          this.setState({Salesunit: result.data.Items})
        }
      });
    }

    getProducttype = () =>{
      var headers = SessionManager.shared().getAuthorizationHeader();
      Axios.get(API.GetProductType, headers)
      .then(result => {
        if(this._isMounted){
          this.setState({Producttype: result.data.Items})
        }
      });
    }

    getCustomer = () =>{
      var headers = SessionManager.shared().getAuthorizationHeader();
      Axios.get(API.GetCustomerData, headers)
      .then(result => {
        if(this._isMounted){
          this.setState({Customer: result.data.Items})
        }
      });
    }

    getProductGroup = () =>{
      var headers = SessionManager.shared().getAuthorizationHeader();
      Axios.get(API.GetProductGroup, headers)
      .then(result => {
        if(this._isMounted){
          this.setState({Productgroup: result.data.Items})
        }
      });
    }

    loadProductDetail = (id) => {
     this.setState({slideproductDetailFlag: true, productId: id});
     Common.showSlideForm();
    }

    copyProduct = (data) => {
      let copyData = data;
      let customerData = this.state.Customer.filter(item => item.key===data.CustomerCode.trim());
      let supplierData = this.state.Supplier.filter(item => item.key===data.SupplierCode.trim());
      copyData.defaultCustomer = { "value": customerData[0].key, "label": customerData[0].value};
      copyData.defaultSupplier = { "value": supplierData[0].key, "label": supplierData[0].value};
      copyData.defaultProductgroup = { "value": data.ProductGroupCode.trim(), "label": data.Productgroup};
      copyData.defaultSalesUnit = { "value": data.SalesUnitCode, "label": data.SalesUnit};
      copyData.defaultPurchaseUnit = { "value": data.PurchaseUnitCode, "label": data.PurchaseUnit};
      copyData.defaultApprove = { "value": data.Approver, "label": data.ApproverUserName};
      this.setState({copyFlag: 0, copyProduct: copyData, slideFormFlag: true});
      Common.showSlideForm();
    }

    addProduct = () => {
      this.setState({copyProduct: '', copyFlag: 1, slideFormFlag: true});
      Common.showSlideForm();
    }

    componentWillUnmount() {
      this._isMounted = false
    }

    setFilterData = () => {
      let filterData = [
          {"label": trls('Productcode'), "value": "Productcode", "type": 'text'},
          {"label": trls('Supplier'), "value": "Supplier", "type": 'text'},
          {"label": trls('Product'), "value": "Product", "type": 'text'},
          {"label": trls('Customer'), "value": "Customer", "type": 'text'},
          {"label": trls('Product_Name'), "value": "Product", "type": 'text'},
          {"label": trls('Sales_Price'), "value": "SalesPrice", "type": 'text'},
          {"label": trls('Purchase_Price'), "value": "PurchasePrice", "type": 'text'},
          {"label": trls('Sales_Unit'), "value": "SalesUnit", "type": 'text'},
          {"label": trls('Purchase_Unit'), "value": "PurchaseUnit", "type": 'text'},
          {"label": trls('Kilogram'), "value": "Kilogram", "type": 'text'},
          {"label": trls('Copy_Product'), "value": "copyproduct", "type": 'text'}
      ]
      this.setState({filterData: filterData});
    }

    filterOptionData = (filterOption) =>{
      let dataA = []
      dataA = Common.filterData(filterOption, this.state.originFilterData);
      if(!filterOption.length){
          dataA=null;
      }
      $('#project_table').dataTable().fnDestroy();
      this.getProductData(dataA);
    }

    changeFilter = () => {
      if(this.state.filterFlag){
          this.setState({filterFlag: false})
      }else{
          this.setState({filterFlag: true})
      }
    }
    // filter module
    addFilterColumn = (value) => {
      // let filterColum = this.state.filterColunm;
      // let filterData = this.state.filterData;
      // let filterItem = [];
      // filterColum = filterColum.filter(function(item, key) {
      //   return item.label === value
      // })
      // filterItem = filterData.filter((item, key)=>item.label===value);
      // if(!filterItem[0]){
      //   filterData.push(filterColum[0]);
      // }
      // this.setState({filterData: filterData})
    }

    removeColumn = (value) => {
      let filterColunm = this.state.filterColunm;
      filterColunm = filterColunm.filter(function(item, key) {
        if(trls(item.label)===value){
          item.show = false;
        }
        return item;
      })
      this.setState({filterColunm: filterColunm})
    }

    showColumn = (value) => {
      let filterColum = this.state.filterColunm;
      filterColum = filterColum.filter((item, key)=>item.label===value);
      return filterColum[0].show;
    }

    render () {
      let productData=this.state.productData;
      const {filterColunm} = this.state;
      return (
        <div className="order_div">
            <div className="content__header content__header--with-line">
                <div id="google_translate_element"></div>
                <h2 className="title">{trls("Products")}</h2>
            </div>
            <div className="orders">
                <Row>
                    <Col sm={6}>
                        <Button variant="primary" onClick={()=>this.addProduct()}><i className="fas fa-plus add-icon"></i>{trls("Add_Product")}</Button>   
                    </Col>
                    <Col sm={6} className="has-search">
                        <div style={{display: 'flex', float: 'right'}}>
                            <Button variant="light" onClick={()=>this.changeFilter()}><i className="fas fa-filter add-icon"></i>{trls('Filter')}</Button>   
                            <div style={{marginLeft: 20}}>
                                <span className="fa fa-search form-control-feedback"></span>
                                <Form.Control className="form-control fitler" type="text" name="number"placeholder={trls("Quick_search")}/>
                            </div>
                        </div>
                    </Col>
                    {this.state.filterData.length>0&&(
                        <Filtercomponent
                            onHide={()=>this.setState({filterFlag: false})}
                            filterData={this.state.filterData}
                            onFilterData={(filterOption)=>this.filterOptionData(filterOption)}
                            showFlag={this.state.filterFlag}
                        />
                    )}
                </Row>
                <div className="table-responsive">
                      <table id="project_table" className="place-and-orders__table table" width="100%">
                        <thead>
                          <tr>
                            {filterColunm.map((item, key)=>(
                                  <th className={!item.show ? "filter-show__hide" : ''} key={key}>
                                      <Contextmenu
                                        triggerTitle = {trls(item.label) ? trls(item.label) : ''}
                                        addFilterColumn = {(value)=>this.addFilterColumn(value)}
                                        removeColumn = {(value)=>this.removeColumn(value)}
                                      />
                                  </th>
                                )
                            )}
                          </tr>
                        </thead>
                        {productData && !this.state.loading&&(<tbody>
                            {
                              productData.map((data,i) =>(
                              <tr id={data.id} key={i}>
                                  <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}>
                                    <div id={data.id} style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadProductDetail(data.id)}>{data.Productcode}</div>
                                  </td>
                                  <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>
                                      {data.Supplier}
                                  </td>
                                  <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.Product}</td>
                                  <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>{data.Customer}</td>
                                  <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>{data.Product}</td>
                                  <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.SalesPrice)}</td>
                                  <td className={!this.showColumn(filterColunm[6].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.PurchasePrice)}</td>
                                  <td className={!this.showColumn(filterColunm[7].label) ? "filter-show__hide" : ''}>{data.SalesUnit}</td>
                                  <td className={!this.showColumn(filterColunm[8].label) ? "filter-show__hide" : ''}>{data.PurchaseUnit}</td>
                                  <td className={!this.showColumn(filterColunm[9].label) ? "filter-show__hide" : ''}>{data.Kilogram}</td>
                                  <td className={!this.showColumn(filterColunm[10].label) ? "filter-show__hide" : ''}>
                                    <Row style={{justifyContent:"center"}}>
                                      <Button id={data.id} variant="light" onClick={()=>this.copyProduct(data)}><i className="fas fa-copy add-icon" ></i>{trls('Copy')}</Button>
                                    </Row>
                                  </td>
                              </tr>
                            ))
                            }
                        </tbody>)}
                    </table>
                    { this.state.loading&& (
                      <div className="col-md-4 offset-md-4 col-xs-12 loading" style={{textAlign:"center"}}>
                          <BallBeat
                              color={'#222A42'}
                              loading={this.state.loading}
                          />
                      </div>
                    )}
                </div>
            </div>
            {this.state.slideFormFlag ? (
              <Productform
                onHide={() => this.setState({slideFormFlag: false})}
                supplier ={this.state.Supplier}
                producttype  ={this.state.Producttype }
                customer  ={this.state.Customer }
                salesunit  ={this.state.Salesunit }
                productgroup  ={this.state.Productgroup}
                token  ={this.state.token}
                purchase_unit = {this.state.purchase_unit}
                approver = {this.state.approve_user}
                copyproduct = {this.state.copyProduct}
                copyflag={this.state.copyFlag}
                customercode={this.state.CustomerCode}
                onShowProductDetail={(productId)=>this.loadProductDetail(productId)}
              />
            ): null}
            {this.state.slideproductDetailFlag ? (
              <Productdetail
                onHide={() => this.setState({slideproductDetailFlag: false})}
                productid={this.state.productId}
              />
            ): null}
            
        </div>
      )
    };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Product);

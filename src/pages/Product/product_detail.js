import React, {Component} from 'react'
import { trls } from '../../components/translate';
import { Button, Spinner } from 'react-bootstrap';
import { Form, Row, Col} from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import Priceform from './product_priceform'
import Updateproductform from './update_product'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import * as Common from '../../components/common'
import FlashMassage from 'react-flash-message'
import Pricelinechangeform from './pricelinechange_form';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({

});
class Productdtail extends Component {
    constructor(props) {
        super(props);
        this.state ={
            purpriceDatalist: [],
            salespriceDatalist: [],
            transportpriceDatalist: [],
            productDetail: [],
            modalShow: false,
            price_flag:"",
            exactFlag: false,
            sendingFlag: false,
            editPriceFlag: false,
            editPriceData: [],
            priceLineData: [],
            newPrice: ''
        }
      }
    componentWillUnmount() {
        this._isMounted = false
    }
    componentDidMount() {
        this._isMounted = true;
        this.getProductDetails();
        this.getPurchasePriceData();
        this.getSalespriceData();
        this.getTransportPriceData();
    }
    
    getProductDetails() {
        let params = {
            id: this.props.productid
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetProduct, params, headers)
        .then(result => {
            if(this._isMounted){    
                this.setState({productDetail: result.data.Items})
            }
        });
    }

    getPurchasePriceData = () => {
        let params = {
            productid: this.props.productid
        }
        this.setState({
            editPriceData: [],
            editPriceFlag: false
        })
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetPurchasePrices, params, headers)
        .then(result => {
            if(this._isMounted){    
                this.setState({purpriceDatalist: result.data.Items})
            }
        });
    }

    getSalespriceData = () => {
        let params = {
            productid: this.props.productid
        }
        this.setState({
            editPriceData: [],
            editPriceFlag: false
        })
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetSalesPrices, params, headers)
        .then(result => {
            if(this._isMounted){    
                this.setState({salespriceDatalist: result.data.Items})
            }
        });
    }

    getTransportPriceData = () =>{
        let params = {
            productid: this.props.productid
        }
        this.setState({
            editPriceData: [],
            editPriceFlag: false
        })
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetTransportPrices, params, headers)
        .then(result => {
            if(this._isMounted){    
                this.setState({transportpriceDatalist: result.data.Items})
            }
        });
    }

    formatDate = (startdate) =>{
        var dd = new Date(startdate).getDate();
        var mm = new Date(startdate).getMonth()+1; 
        var yyyy = new Date(startdate).getFullYear();
        var formatDate = '';
        if(dd<10) 
        {
            dd='0'+dd;
        } 

        if(mm<10) 
        {
            mm='0'+mm;
        } 
        formatDate = dd+'-'+mm+'-'+yyyy;
        return formatDate;
    }
    formatNumber = (num) => {
        return  "€" + num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    priceApproveConfirm = (event) => {
        let priceid = event.currentTarget.id;
        let priceType = event.currentTarget.name
        confirmAlert({
            title: 'Confirm',
            message: 'Are you sure to approve this price?',
            buttons: [
              {
                label: 'OK',
                onClick: () => {
                   this.priceApprove(priceid, priceType)
                }
              },
              {
                label: 'Cancel',
                onClick: () => {}
              }
            ]
          });
    }

    priceApprove = (priceid, priceType) => {
        this._isMounted=true;
        let url = '';
        let params = {
            priceid:priceid
        }
        if(priceType==="purchase"){
            url = API.ApprovePurchasePrice;
        }else if(priceType==="sales"){
            url = API.ApproveSalesPrice;
        }else{
            url = API.ApproveTransportPrice;
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(url, params, headers)
        .then(result => {
            if(this._isMounted){    
                this.getPurchasePriceData();
                this.getSalespriceData();
                this.getTransportPriceData();
            }
        });
    }

    generateProductXml = () => {
        this.setState({sendingFlag: true})
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            productid: this.props.productid
        }
        Axios.post(API.PostProductsExact, params, headers)
        .then(result => {
            Axios.get(API.GenerateProductXmlExact, headers)
            .then(result => {
                Axios.post(API.PostProductsExactSend, params, headers)
                .then(result => {
                    this.setState({exactFlag: true, sendingFlag: false})
                });
            });
        });
        
    }

    viewPurchaseLine = (startDate, endDate, newPrice, price_flag, transportCode) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = {};
        let URL = "";
        if(price_flag === 1 || price_flag === 2){
            params = {
                productid: this.props.productid,
                startdate: Common.formatDateSecond(startDate),
                enddate: Common.formatDateSecond(endDate),
            }
            if(price_flag === 1){
                URL = API.GetPurchaseLinesToChange;
            }else{
                URL = API.GetSalesLinesToChange;
            }
        }else{
            URL = API.GetTransportLinesToChange;
            params = {
                transportercode: transportCode,
                startdate: Common.formatDateSecond(startDate),
                enddate: Common.formatDateSecond(endDate),
            }
        }
        Axios.post(URL, params, headers)
        .then(result => {
            if(result.data.Success){
                this.setState({priceLineShowModal: true, newPrice: newPrice, priceLineData: result.data.Items})
            }
        })
    }

    changePurchasePrice = (id) => {
        let purpriceDatalist = this.state.purpriceDatalist;
        purpriceDatalist.map((data, index)=>{
            if(data.Id===id){
                if(data.checked){
                    data.checked = false
                }else{
                    data.checked = true
                }
            }
            return data;
        });
        this.setState({purpriceDatalist: purpriceDatalist});
    }

    deletePrice = (id, mode) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        let URL = '';
        if(mode===1){
            URL = API.DeletePurchasePrice;
        }else{
            URL = API.DeleteSalesPrice;
        }
        let params = {
            id: id
        }
        Axios.post(URL, params, headers)
        .then(result => {
            if(result.data.Success){
                if(mode===1){
                    this.getPurchasePriceData();
                }else{
                    this.getSalespriceData();
                }
            }
        })
    }

    removeState = () => {
        this.setState({
            modalShow: false,
            price_flag:"",
            exactFlag: false,
            sendingFlag: false,
            editPriceFlag: false,
            editPriceData: [],
            priceLineData: [],
            newPrice: ''
        })
    }

    onHide = () => {
        this.props.onHide();
        Common.hideSlideForm();
    }

    render () {
        let detailData = [];
        let purpriceData = [];
        let salespriceData = [];
        let transportData = [];
        if(this.state.productDetail[0]){
            detailData = this.state.productDetail[0];
        }
        if(this.state.purpriceDatalist){
            purpriceData = this.state.purpriceDatalist
        }
        if(this.state.salespriceDatalist){
            salespriceData = this.state.salespriceDatalist;
        }
        if(this.state.transportpriceDatalist){
            transportData=this.state.transportpriceDatalist;
        }
        const pricingtypelist = {'1' :'Blokvracht','2' :'Eenheidsprijs'}
        return (
            <div className = "slide-form__controls open slide-product__detail">
                <div style={{marginBottom:30, padding:"0 20px"}}>
                    <i className="fas fa-times slide-close" style={{ fontSize: 20, cursor: 'pointer'}} onClick={()=>this.onHide()}></i>
                </div>
                <div className="content__header content__header--with-line product-detail__data--detail">
                    <h2 className="title">{trls("Product_Details")}</h2>
                </div>
                <div className="place-and-orders product-detail_main">
                    {this.state.exactFlag&&(
                        <div>
                            <FlashMassage duration={2000}>
                                <div className="alert alert-success" style={{marginTop:10}}>
                                    <strong><i className="fas fa-check-circle"></i> Success!</strong>
                                </div>
                            </FlashMassage>
                        </div>
                    )
                    }
                    {this.state.sendingFlag&&(
                        <div style={{marginTop:10, padding: "0 45px"}}><Spinner animation="border" variant="info"/><span style={{marginTp:10, fontWeight: "bold", fontSize: 16}}> {trls('Sending')}...</span></div>
                    )}
                    <div className="place-and-orders__top">
                        <Row className="product-detail__data-div">
                            <Col sm={6}>
                                <div>
                                    <Form.Label>
                                        {trls("Productcode")}
                                    </Form.Label>
                                    <p className="product-detail__data">{detailData.productcode}</p>
                                </div>
                                <div style={{paddingTop: 30}}>
                                    <Form.Label>
                                        {trls("Supplier")}
                                    </Form.Label>
                                    <p className="product-detail__data">{detailData.Supplier}</p>
                                </div>
                                <div>
                                    <Button variant="light" style={{marginRight: 10}} onClick={()=>this.setState({modalEditShow:true, exactFlag: false})}><img src={require('../../assets/images/edit.svg')} alt="edit" style={{marginRight: 10}}></img>{trls('Edit_project_detail')}</Button>
                                    <Button variant="primary" onClick={()=>this.generateProductXml()}><i className="fas fa-plus add-icon"></i>{trls("Send_to_Exact")}</Button>
                                </div>
                            </Col>
                            <Col sm={2}>
                                <div>
                                    <Form.Label>
                                        {trls("Product")}
                                    </Form.Label>
                                    <p className="product-detail__data">{detailData.product}</p>
                                </div>
                                <div style={{paddingTop: 30}}>
                                    <Form.Label>
                                        {trls("Customer")}
                                    </Form.Label>
                                    <p className="product-detail__data">{detailData.Customer}</p>
                                </div>
                            </Col>
                            <Col sm={2}>
                                <div>
                                    <Form.Label>
                                        {trls("Productgroup")}
                                    </Form.Label>
                                    <p className="product-detail__data">{detailData.Productgroup}</p>
                                </div>
                                <div style={{paddingTop: 30}}>
                                    <Form.Label>
                                        {trls("Salesunit")}
                                    </Form.Label>
                                    <p className="product-detail__data">{detailData.Salesunit}</p>
                                </div>
                            </Col>
                            <Col sm={2}>
                                <div>
                                    <Form.Label>
                                        {trls("Purchase_Unit")}
                                    </Form.Label>
                                    <p className="product-detail__data">{detailData.PurchaseUnit}</p>
                                </div>
                                <div style={{paddingTop: 30}}>
                                    <Form.Label>
                                        {trls("Kilogram")}
                                    </Form.Label>
                                    <p className="product-detail__data">{detailData.kilogram}</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className={"product-detail-table"}>
                        <div className="product-price-table">
                            <div className="purchase-price__div">
                                <p className="purprice-title"><i className="fas fa-caret-right add-icon" style={{color: "#4697D1"}}></i>{trls("Purchase_Price")}</p>
                                <Button variant="outline-secondary" style={{marginLeft: "auto"}} onClick={()=>this.setState({modalShow:true, price_flag:1})}><i className="fas fa-plus add-icon"></i>{trls('Add_Purchase_Price')}</Button>
                            </div>
                            <div className="prurprice-table__div">
                                <table className="place-and-orders__table table table--striped prurprice-dataTable">
                                    <thead>
                                        <tr>
                                            <th>{trls("Price")}</th>
                                            <th>{trls("Start_date")}</th>
                                            <th>{trls("End_date")}</th>
                                            <th style={{width:"10%"}}>{trls("Approve")}</th>
                                            <th style={{width: 250}}>{trls("Action")}</th>
                                        </tr>
                                    </thead>
                                        {purpriceData &&(<tbody>
                                            {
                                                purpriceData.map((data,i) =>(
                                                <tr id={i} key={i} style={{verticalAlign:"middle"}}>
                                                    <td>{Common.formatMoney(data.Price)}</td>
                                                    <td>{Common.formatDate(data.StartDate)}</td>
                                                    <td>{Common.formatDate(data.EndDate)}</td>
                                                    {!data.isApproved?(
                                                        <td style={{textAlign:"center", paddingBottom:"0px", paddingTop:"0px"}}><Button id={data.Id} name="purchase" type="submit" style={{height:"31px",fontSize:"12px"}} onClick={this.priceApproveConfirm}>{trls('Approve')}</Button></td>
                                                    ):<td style={{textAlign:"center"}}></td>}
                                                    <td>
                                                        <Row style={{justifyContent:"space-around"}}>
                                                            {data.canDelete !== "false"&&(
                                                                <Button id={data.Id} className="price-action__button" variant="light" onClick={()=>this.deletePrice(data.Id, 1)}><i className="far fa-trash-alt add-icon" ></i>{trls('Delete')}</Button>
                                                            )}
                                                            <Button id={data.Id} className="price-action__button" variant="light" onClick={()=>this.setState({ price_flag:1, editPriceFlag: true, editPriceData: data, modalShow: true})}><i className="fas fa-pen add-icon" ></i>{trls('Edit')}</Button>
                                                        </Row>
                                                    </td>
                                                </tr>
                                            ))
                                            }
                                        </tbody>)}
                                </table>
                            </div>
                        </div>
                        <div className="product-price-table">
                            <div className="purchase-price__div">
                                <p className="purprice-title"><i className="fas fa-caret-right add-icon" style={{color: "#4697D1"}}></i>{trls("Sales_Price")}</p>
                                <Button variant="outline-secondary" style={{marginLeft: "auto"}} onClick={()=>this.setState({modalShow:true, price_flag:2})}><i className="fas fa-plus add-icon"></i>{trls('Add_Salese_Price')}</Button>
                            </div>
                            <div className="prurprice-table__div">
                                <table className="place-and-orders__table table table--striped prurprice-dataTable">
                                    <thead>
                                    <tr>
                                        <th>{trls("Price")}</th>
                                        <th>{trls("Start_date")}</th>
                                        <th>{trls("End_date")}</th>
                                        <th style={{width:"10%"}}>{trls("Approve")}</th>
                                        <th style={{width: 250}}>{trls("Action")}</th>
                                    </tr>
                                    </thead>
                                    {salespriceData &&(<tbody>
                                        {
                                            salespriceData.map((data,i) =>(
                                            <tr id={i} key={i}>
                                                <td>{Common.formatMoney(data.Price)}</td>
                                                <td>{Common.formatDate(data.StartDate)}</td>
                                                <td>{Common.formatDate(data.EndDate)}</td>
                                                {!data.isApproved?(
                                                    <td style={{textAlign:"center", paddingBottom:"0px", paddingTop:"0px"}}><Button id={data.Id} name="sales" type="submit" style={{height:"31px",fontSize:"12px"}} onClick={this.priceApproveConfirm}>{trls('Approve')}</Button></td>
                                                ):<td style={{textAlign:"center"}}></td>}
                                                <td>
                                                    <Row style={{justifyContent:"space-around"}}>
                                                        {data.canDelete !== "false"&&(
                                                            <Button id={data.Id} className="price-action__button" variant="light" onClick={()=>this.deletePrice(data.Id, 2)}><i className="far fa-trash-alt add-icon" ></i>{trls('Delete')}</Button>
                                                        )}
                                                        <Button id={data.Id} className="price-action__button" variant="light" onClick={()=>this.setState({ price_flag:2, editPriceFlag: true, editPriceData: data, modalShow: true})}><i className="fas fa-pen add-icon" ></i>{trls('Edit')}</Button>
                                                    </Row>
                                                </td>
                                            </tr>
                                        ))
                                        }
                                    </tbody>)}
                                </table>
                            </div>
                        </div>
                        <div className="product-price-table transport">
                            <div className="purchase-price__div">
                                <p className="purprice-title"><i className="fas fa-caret-right add-icon" style={{color: "#4697D1"}}></i>{trls("Transport_Price")}</p>
                                <Button variant="outline-secondary" style={{marginLeft: "auto"}} onClick={()=>this.setState({modalShow:true, price_flag:3})}><i className="fas fa-plus add-icon"></i>{trls('Add_Transport_Price')}</Button>
                            </div>
                            <div className="prurprice-table__div">
                                <table className="place-and-orders__table table table--striped prurprice-dataTable">
                                    <thead>
                                    <tr>
                                        <th>{trls('Transporter')}</th>
                                        <th>{trls('Pricingtype')}</th>
                                        <th>{trls('Price')}</th>
                                        <th>{trls('Start_date')}</th>
                                        <th>{trls('End_date')}</th>
                                        <th style={{width:"10%"}}>{trls("Approve")}</th>
                                        <th style={{width: 200}}>{trls("Action")}</th>
                                    </tr>
                                    </thead>
                                    {transportData &&(<tbody>
                                        {
                                            transportData.map((data,i) =>(
                                            <tr id={i} key={i}>
                                                <td>{data.Transporter}</td>
                                                <td>{pricingtypelist[data.pricingtype]}</td>
                                                <td>{Common.formatMoney(data.price)}</td>
                                                <td>{Common.formatDate(data.startdate)}</td> 
                                                <td>{Common.formatDate(data.enddate)}</td> 
                                                {!data.isApproved?(
                                                    <td style={{textAlign:"center", paddingBottom:"0px", paddingTop:"0px"}}><Button id={data.Id} name="transport" type="submit" style={{height:"31px",fontSize:"12px"}} onClick={this.priceApproveConfirm}>{trls('Approve')}</Button></td>
                                                ):<td style={{textAlign:"center"}}></td>}
                                                <td>
                                                    <Row style={{justifyContent:"space-around"}}>
                                                        <Button id={data.Id} className="price-action__button" variant="light" onClick={()=>this.setState({ price_flag:3, editPriceFlag: true, editPriceData: data, modalShow: true})}><i className="fas fa-pen add-icon" ></i>{trls('Edit')}</Button>
                                                    </Row>
                                                </td>
                                            </tr>
                                        ))
                                        }
                                    </tbody>)}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <Priceform
                    show={this.state.modalShow}
                    onHide={() => this.setState({modalShow: false})}
                    productid={this.props.productid}
                    price_flag={this.state.price_flag}
                    onGetPurchasePrice={this.getPurchasePriceData}
                    onGetSalesPrice={this.getSalespriceData}
                    onGetTransportPrice={this.getTransportPriceData}
                    editpriceflag={this.state.editPriceFlag}
                    editpricedata={this.state.editPriceData}
                    viewPurchaseLine={(startDate, endDate, newPrice, price_flag, transportCode)=>this.viewPurchaseLine(startDate, endDate, newPrice, price_flag, transportCode)}
                    onRemoveState={()=>this.removeState()}               
                />
                <Updateproductform
                    show={this.state.modalEditShow}
                    onHide={() => this.setState({modalEditShow: false})}
                    getproductetails={()=>this.getProductDetails()}
                    productid={this.props.productid}
                    copyflag={0}
                    copyproduct = {detailData}
                />
                <Pricelinechangeform
                    show={this.state.priceLineShowModal}
                    onHide={() => this.setState({priceLineShowModal: false, purchaseLineData: [], newPrice: ''})}
                    pricelinedata={this.state.priceLineData}
                    newprice={this.state.newPrice}
                    price_flag={this.state.price_flag}
                />
            </div>
        )
    };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Productdtail);

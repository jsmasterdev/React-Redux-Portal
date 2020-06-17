import React, {Component} from 'react'
import { Row, Col, Form, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import Axios from 'axios';
import API from '../../components/api'
import { trls } from '../../components/translate';
import  Salesupdateform  from './salesupdateform'
import  Addproductform  from './addproduct_form';
import  Updateorderline  from './updateorderLine_form';
import  Updatetransport  from './update_transport';
import  Addtransporter  from './addtransporter';
import * as Common from '../../components/common';
import Pageloadspiiner from '../../components/page_load_spinner';
import Addtextform from './addtext_form';

const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = dispatch => ({
    
});

class Salesorderdtail extends Component {
    constructor(props) {
        let pathname = window.location.pathname;
        let pathArray = pathname.split('/');
        super(props);
        this.state ={
            orderdate: '', 
            salesorderid:'',
            salesorder:[],
            salesItems:[],
            exactFlag: false,
            sendingFlag: false,
            salesTransport: [],
            transportData: [],
            transportResult: [],
            salesOrderDocList: [],
            lodingFlag: false,
            detailData: [],
            purchaseFlag: pathArray[2] ? true : false,
            salesDetailFlag: false,
            purchaseTextLines: [],
            updatePurchaseText: []
        }
      }
    componentDidMount() {
        Common.showSlideForm();
        this.getSalesOrder();
        this.getSalesItem();
        this.getSalesOrderTransports();
        this.getPurchaseTextLines();
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    getSalesOrder() {
        this.setState({salesDetailFlag: false});
        var params={
            "salesorderid":this.props.newid
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetSalesDetail, params, headers)
        .then(result => {
            params = {
                orderid: this.props.newid
            }
            Axios.post(API.GetSalesDocuments, params, headers)
            .then(result => {
                if(result.data.Items){
                    this.setState({salesOrderDocList: result.data.Items})
                }
            })
            this.setState({salesorder: result.data.Items[0], salesDetailFlag: true});
        });
    }

    getSalesItem () {
        var params={
            "orderid":this.props.newid
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
            Axios.post(API.GetSalesOrderLines, params, headers)
            .then(result => {
                this.setState({salesItems: result.data.Items})
            });
    }

    getSalesOrderTransports() {
        var params={
            "orderid":this.props.newid
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetSalesOrderTransports, params, headers)
        .then(result => {
            this.setState({salesTransport: result.data.Items})
        });
    }

    generateSalesInvoiceXmlExact = () => {
        this.setState({sendingFlag: true})
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            salesid: this.props.newid
        }
        Axios.post(API.PostSalesOrderExact, params, headers)
        .then(result => {
            Axios.get(API.GenerateProductXmlExact, headers)
            .then(result => {
                Axios.post(API.PostSalesOrderExactSend, params, headers)
                .then(result => {
                    this.setState({exactFlag: true, sendingFlag: false})
                });
            });
        });
    }

    orderLineEdit = (data) => {
        this.setState({upadateDate: data, showModalUpdate: true})
    }

    orderLineDelete = (id) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            id: id
        }
        Axios.post(API.DeleteSalesOrderLine, params, headers)
        .then(result => {
            this.getSalesItem();
        });
    }

    transporterEdit = (data) => {
        this.setState({transportUpadateDate: data, transportShowModal: true})
    }

    transporterDelete = (id) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            id: id
        }
        Axios.post(API.DeleteTransports, params, headers)
        .then(result => {
            this.getSalesOrderTransports();
        });
    }

    addTransport = (transportData) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = {
            productid: transportData.productid,
            loadingdate: this.state.salesorder.loadingdate,
            quantity: transportData.quantity
        }
        Axios.post(API.GetTransports, params, headers)
        .then(result => {
            this.setState({transportData: transportData, transportResult: result.data.Items, addTransporterModal: true})
        });
    }

    onHide = () => {
        if(!this.props.viewDetailFlag){
            this.props.onGetSalesData();
        }
        this.props.onHide();
        Common.hideSlideForm();
    }

    updownInfo = (id) =>{
        let salesArray = this.state.salesItems;
        salesArray.map((data, i)=>{
            if(data.id===id){
                if(!data.checked){

                    data.checked = true;
                }else{
                    data.checked = false;
                }
            }
            return data;
        })
        this.setState({salesItems: salesArray});
    }

    downLoadFile = (fileId) => {
        window.open(API.GetDownloadFile+fileId);
    }

    deleteSalesOrderDocment = (fileId) => {
        let params = {
            filestorageid: fileId
        }
        var header = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.DeleteSalesDocument, params, header)
        .then(result=>{
            if(result.data.Success){
                this.getSalesOrder();
            }
        })
    }

    getPurchaseTextLines = () => {
        this._isMounted = true;
        var params = {
            salesorderheaderid:this.props.newid
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetTextLines, params, headers)
        .then(result => {
            if(this._isMounted) {
                this.setState({purchaseTextLines: result.data.Items});
            }
        });
    }

    deletePurchaseText = (id) => {
        let params = {
            id: id
        }
        var header = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.DeleteTextLine, params, header)
        .then(result=>{
            if(result.data.Success){
                this.getPurchaseTextLines();
            }
        })
    }

    render () {
        let detailData = this.state.salesorder;
        let salesItems = this.state.salesItems;
        let transporter = this.state.salesTransport;
        const { salesOrderDocList, lodingFlag, purchaseFlag, salesDetailFlag, purchaseTextLines } = this.state;
        return (
            <div className="slide-form__controls open slide-product__detail">
                <div style={{marginBottom:30, padding:"0 20px"}}>
                    { !purchaseFlag ? (
                        <i className="fas fa-times slide-close" style={{ fontSize: 20, cursor: 'pointer'}} onClick={()=>this.onHide()}></i>
                    ): null}
                    
                </div>
                <div className="content__header content__header--with-line product-detail__data--detail">
                    <h2 className="title">{trls("Order")} #{this.props.newid}</h2>
                </div>
                <div className="place-and-orders__top">
                    <Row className="product-detail__data-div">
                        <Col sm={4}>
                            <div>
                                <Form.Label>
                                    {trls("Customer")}
                                </Form.Label>
                                <p className="product-detail__data">{detailData.Customer ? detailData.Customer : 'Nog te plannen'}</p>
                            </div>
                            <div style={{paddingTop: 30}}>
                                <Form.Label>
                                    {trls("Reference_customer")}
                                </Form.Label>
                                <p className="product-detail__data">{detailData.referencecustomer}</p>
                            </div>
                            <Col style={{padding: "20px 0px", paddingTop: 0}}>
                                <div id="react-file-drop-demo" className = "purhcase-order__doc">
                                    {salesOrderDocList.length>0&&(
                                        salesOrderDocList.map((data,i) =>(
                                            <div id={i} key={i}>
                                                <span className="docList-text" onClick={()=>this.downLoadFile(data.FileStorageId)}>{data.FileName}</span>
                                                <i className="fas fa-trash-alt add-icon doclist-delete__icon" onClick={()=>this.deleteSalesOrderDocment(data.FileStorageId)}></i>
                                            </div>
                                        ))
                                    )
                                    }
                                </div>
                                <label className="placeholder-label_purchase purhcase-placeholder">{trls('File')}</label>
                            </Col>
                        </Col>
                        <Col sm={4}>
                            <div>
                                <Form.Label>
                                    {trls("Supplier")}
                                </Form.Label>
                                <p className="product-detail__data">{detailData.Supplier}</p>
                            </div>
                            {detailData.arrivaldate!=="1900-01-01T00:00:00" && (
                                <div style={{paddingTop: 30}}>
                                    <Form.Label>
                                        {trls("Arrival_date")}
                                    </Form.Label>
                                    {detailData.arrivaldate &&(
                                        <p className="product-detail__data">{Common.formatDate(detailData.arrivaldate)}</p>
                                    )}
                                </div>
                            )}
                        </Col>
                        <Col sm={4}>
                            <div>
                                <Form.Label>
                                    {trls("Loading_date")}
                                </Form.Label>
                                {detailData.loadingdate!=="1900-01-01T00:00:00" &&(
                                    <p>{detailData.arrivaldate!=="1900-01-01T00:00:00" ? Common.formatDate(detailData.arrivaldate) : Common.formatDate(detailData.loadingdate)}</p>
                                )}
                            </div>
                        </Col>
                    </Row>
                    <div className="product-detail__data-div">
                        <Col style={{paddingTop: 0}}>
                            <Form.Control as="textarea" rows="3" name="comments" required readOnly defaultValue = {detailData.Comments ?  detailData.Comments : ''} placeholder={trls("Comments")} />
                            <label className="placeholder-label">{trls('Comments')}</label>
                        </Col>
                        <Col style={{paddingTop: 10}}>
                            <Button variant="light" style={{marginRight: 10}} onClick={()=>this.setState({modalShow:true, exactFlag: false})}><img src={require('../../assets/images/edit.svg')} alt="edit" style={{marginRight: 10}}></img>{trls('Edit_Order_detail')}</Button>
                        </Col>
                    </div>
                </div>
                <div className="product-detail-table">
                    <div className="product-price-table">
                        <div className="purchase-price__div">
                            <p className="purprice-title"><i className="fas fa-caret-right add-icon" style={{color: "#4697D1"}}></i>{trls("Products")}</p>
                            <Button variant="outline-secondary" style={{marginLeft: "auto"}} onClick={()=>this.setState({showModalProduct: true})}><i className="fas fa-plus add-icon"></i>{trls('Add_product')}</Button>
                        </div>
                        <div className="table-responsive prurprice-table__div">
                            <table id="example" className="place-and-orders__table table" width="100%">
                                <thead>
                                    <tr>
                                        <th>{trls("Product")}</th>
                                        <th>{trls("Sales_Quantity")}</th>
                                        <th>{trls("Sales_Price")}</th>
                                        <th>{trls("Sales_Amount")}</th>
                                        <th>{trls("Purchase_Quantity")}</th>
                                        <th>{trls("Purchase_Price")}</th>
                                        <th>{trls("Purchase_Amount")}</th>
                                        <th style={{width: "109px"}}>{trls("ReportingDate")}</th>
                                        <th style={{width: 250}}>{trls("Action")}</th>
                                    </tr>
                                </thead>
                                {salesItems && (<tbody>
                                    {
                                    salesItems.map((data,i)=>(
                                        <React.Fragment key={i}>
                                            <tr>
                                                <td className={data.checked ? "order-product__td order-product__first-td" : ''}>{data.productcode}</td>
                                                <td className={data.checked ? "order-product__td" : ''}>
                                                    {data.salesquantity}
                                                </td>
                                                <td className={data.checked ? "order-product__td" : ''}>{Common.formatMoney(data.SalesPrice)}</td>
                                                <td className={data.checked ? "order-product__td" : ''}>{Common.formatMoney(data.SalesAmount)}</td>
                                                <td className={data.checked ? "order-product__td" : ''}>{data.purchasequantity}</td>
                                                <td className={data.checked ? "order-product__td" : ''}>{Common.formatMoney(data.purchaseprice)}</td>
                                                <td className={data.checked ? "order-product__td" : ''}>{Common.formatMoney(data.purchaseamount)}</td>
                                                <td className={data.checked ? "order-product__td" : ''}>{Common.formatDate(data.ReportingDate)==="01-01-1970" ? '' : Common.formatDate(data.ReportingDate)}</td>
                                                <td className={data.checked ? "order-product__td order-product__last-td" : ''}>
                                                    <Row style={{justifyContent:"space-around", width: 250}}>
                                                        <Button className="price-action__button" variant="light" onClick={()=>this.orderLineDelete(data.id)}><i className="far fa-trash-alt add-icon" ></i>{trls('Delete')}</Button>
                                                        <Button className="price-action__button" variant="light" onClick={()=>this.orderLineEdit(data)}><i className="fas fa-pen add-icon" ></i>{trls('Edit')}</Button>
                                                        <Button className="price-action__button" variant="light" onClick={()=>this.updownInfo(data.id)}><i className={data.checked ? "fas fa-caret-up" : "fas fa-caret-down"}></i></Button>
                                                    </Row>
                                                </td>
                                            </tr>
                                            {data.checked && (
                                                <tr>
                                                    <td className={data.checked ? "order-product__first-td" : ''}></td>
                                                    <td>
                                                        <div>{trls("Packing_slip_number")}</div>
                                                        <div style={{paddingTop: 20}}>{data.PackingSlip}</div>
                                                    </td>
                                                    <td>
                                                        <div>{trls("Container_number")}</div>
                                                        <div style={{paddingTop: 20}}>{data.Container}</div>
                                                    </td>
                                                    <td>
                                                        <div>{trls("ShippingDocumentnumber")}</div>
                                                        <div style={{paddingTop: 20}}>{data.Shipping}</div>
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td className={data.checked ? "order-product__last-td" : ''}></td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                }
                            </tbody>)}
                        </table>
                    </div>
                </div>
                <div className="product-price-table">
                    <div className="purchase-price__div">
                        <p className="purprice-title"><i className="fas fa-caret-right add-icon" style={{color: "#4697D1"}}></i>{trls("Transporter")}</p>
                    </div>
                    <div className="table-responsive prurprice-table__div">
                        <table id="example" className="place-and-orders__table table" width="100%">
                            <thead>
                                <tr>
                                    <th>{trls("Transporter")}</th>
                                    <th>{trls("Pricingtype")}</th>
                                    <th>{trls("Price")}</th>
                                    <th>{trls("Packing_slip_number")}</th>
                                    <th>{trls("Container_number")}</th>
                                    <th>{trls("ShippingDocumentnumber")}</th>
                                    <th>{trls("Action")}</th>
                                    
                                </tr>
                            </thead>
                            {transporter && (<tbody>
                                {
                                    transporter.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td>{data.Transporter}</td>
                                        <td>{data.pricingtype}</td>
                                        <td>{Common.formatMoney(data.price)}</td>
                                        <td>{data.packingslip}</td>
                                        <td>{data.container}</td>
                                        <td>{data.shipping}</td>
                                        <td >
                                            <Row style={{justifyContent:"space-around", width: 200}}>
                                                <Button className="price-action__button" variant="light" onClick={()=>this.transporterDelete(data.id)}><i className="far fa-trash-alt add-icon" ></i>{trls('Delete')}</Button>
                                                <Button className="price-action__button" variant="light" onClick={()=>this.transporterEdit(data)}><i className="fas fa-pen add-icon" ></i>{trls('Edit')}</Button>
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
                        <p className="purprice-title"><i className="fas fa-caret-right add-icon" style={{color: "#4697D1"}}></i>{trls("Text lines")}</p>
                        <Button variant="outline-secondary" style={{marginLeft: "auto"}} onClick={()=>this.setState({showTextModal: true})}><i className="fas fa-plus add-icon"></i>{trls('Add Text')}</Button>
                    </div>
                    <div className="table-responsive prurprice-table__div">
                        <table id="example" className="place-and-orders__table table" width="100%">
                            <thead>
                                <tr>
                                    <th>{trls('Text lines')}</th>
                                    <th>{trls('Action')}</th>
                                </tr>
                            </thead>
                            {purchaseTextLines && (<tbody>
                                {
                                    purchaseTextLines.map((data,i) =>(
                                    <tr id={data.Id} key={i}>
                                        <td>{data.description}</td>
                                        <td style={{width: 250}}>
                                            <Row style={{justifyContent:"space-around"}}>
                                                <Button className="price-action__button" variant="light" onClick={()=>this.deletePurchaseText(data.id)}><i className="far fa-trash-alt add-icon" ></i>{trls('Delete')}</Button>
                                                <Button className="price-action__button" variant="light" onClick={()=>this.setState({showTextModal: true, updatePurchaseText: data})}><i className="fas fa-pen statu-item add-icon" ></i>{trls('Edit')}</Button>
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
            <Salesupdateform
                show={this.state.modalShow}
                onHide={() => this.setState({modalShow: false})}
                salesOrder={this.state.salesorder}
                arrivaldate={this.state.salesorder.arrivaldate!=="1900-01-01T00:00:00" ? true : false}
                getSalesOrderData={()=>this.getSalesOrder()}
                onLoadingFlag={(value) => this.setState({lodingFlag: value})}
            />
            {detailData.loadingdate && salesDetailFlag &&(
                <Addproductform
                    show={this.state.showModalProduct}
                    onHide={() => this.setState({showModalProduct: false})}
                    customercode={detailData.CustomerCode}
                    suppliercode={detailData.SupplierCode}
                    loadingdate={detailData.loadingdate}
                    arrivaldate={detailData.arrivaldate}
                    orderid={this.props.newid}
                    getSalesOrderLine={()=>this.getSalesItem()}
                    getTransport={()=>this.getSalesOrderTransports()}
                    showTransportModal={(transportData) => this.addTransport(transportData)}
                />
            )}
            <Updateorderline
                show={this.state.showModalUpdate}
                onHide={() => this.setState({showModalUpdate: false})}
                updatedata={this.state.upadateDate}
                getSalesOrderLine={()=>this.getSalesItem()}
            />
            <Updatetransport
                show={this.state.transportShowModal}
                onHide={() => this.setState({transportShowModal: false})}
                updatedata={this.state.transportUpadateDate}
                getSalesOrderLine={()=>this.getSalesOrderTransports()}
            />
            <Addtransporter
                show={this.state.addTransporterModal}
                onHide={() => this.setState({addTransporterModal: false})}
                loadingdate={this.state.salesorder.loadingdate}
                transportResult={this.state.transportResult}
                transportdata={this.state.transportData}
                orderid={this.props.newid}
                getSalesOrderLine={()=>this.getSalesOrderTransports()}
            />
             <Addtextform
                show={this.state.showTextModal}
                onHide={() => this.setState({showTextModal: false, updatePurchaseText: []})}
                salesId={this.props.newid}
                updateData={this.state.updatePurchaseText}
                getPurchaseTextLines={()=>this.getPurchaseTextLines()}
            />
            <Pageloadspiiner loading = {lodingFlag}/>
        </div>
        )
    };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Salesorderdtail);
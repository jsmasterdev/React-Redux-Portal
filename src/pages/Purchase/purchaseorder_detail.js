import React, {Component} from 'react'
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import Axios from 'axios';
import API from '../../components/api'
import { trls } from '../../components/translate';
import Updatepurchaseform  from './updatepurchase_form'
import Addpurchaseform  from './addpruchase_form'
import * as Common from '../../components/common'
import FlashMassage from 'react-flash-message';
import Addmanuallytranspor from './transportmanualform'
import Sweetalert from 'sweetalert';

const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = dispatch => ({

});

class Purchaseorderdtail extends Component {
    constructor(props) {
        super(props);
        this.state ={
            orderdate: '', 
            salesorderid:'',
            purchaseOrder:[],
            exactFlag: false,
            sendingFlag: false,
            purchaseOrderLine: [],
            totalAmount: 0,
            supplierCode: '',
            purchaseTransportManualLine: [],
            totalManualAmount: 0,
            updateManualData: [],
            defaultVatCode: '',
            vatCodeList: [], 
            purchaseOrderDocList: []
        }
      }
    componentDidMount() {
        this.getPurchaseOrder();
        this.getPurchaseOrderLines();
        this.getPurchaseTransportManual();
    }
    getPurchaseOrder() {
        var params= {
            "purchaseorderid":this.props.newId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetPurchaseOrder, params, headers)
        .then(result => {
            params = {
                orderid: this.props.newId
            }
            Axios.post(API.GetPurchaseDocuments, params, headers)
            .then(result => {
                if(result.data.Items){
                    this.setState({purchaseOrderDocList: result.data.Items})
                }
            })
            this.setState({purchaseOrder: result.data.Items[0]});
            let purChaseOrder = result.data.Items[0];
            if(!result.data.Items[0].istransport){
                Axios.get(API.GetSuppliersDropdown, headers)
                .then(result => {
                    var suparams = {
                        supplier: purChaseOrder.suppliercode
                    }
                    Axios.post(API.GetDefaultVatCode, suparams, headers)
                    .then(result => {
                        if(result.data.Success){
                            let defaultVatCode = '';
                            if(result.data.Items[0]){
                                defaultVatCode = result.data.Items[0].VatCode;
                            }
                            Axios.get(API.GetVATCode, headers)
                            .then(result => {
                                    let vatCode = result.data.Items.map( s => ({value:s.key,label:s.value}));
                                    var item = vatCode.filter(item => item.value===defaultVatCode);
                                    this.setState({vatCodeList: vatCode, defaultVatCode: item})
                            });
                        }
                    });
                    this.setState({supplierCode: purChaseOrder.suppliercode})
                });
            }else{
                Axios.get(API.GetTransportersDropdown, headers)
                .then(result => {
                    var suparams = {
                        supplier: purChaseOrder.suppliercode
                    }
                    Axios.post(API.GetDefaultVatCode, suparams, headers)
                    .then(result => {
                        if(result.data.Success){
                            let defaultVatCode = '';
                            if(result.data.Items[0]){
                                defaultVatCode = result.data.Items[0].VatCode
                            }
                            Axios.get(API.GetVATCode, headers)
                            .then(result => {
                                    let vatCode = result.data.Items.map( s => ({value:s.key,label:s.value}));
                                    var item = vatCode.filter(item => item.value===defaultVatCode);
                                    this.setState({vatCodeList: vatCode, defaultVatCode: item})
                            });
                        }
                    });
                    this.setState({supplierCode: purChaseOrder.suppliercode})
                });
            }
            this.setState({purchaseOrder: result.data.Items[0]});
        });
    }

    getPurchaseOrderLines () {
        this.setState({
            updateManualData: [],
        })
        var params = {
            purchaseorderid:this.props.newId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetPurchaseOrderLines, params, headers)
        .then(result => {
            let totalAmount = 0;
            result.data.Items.map((data, index)=>{
                if(!this.state.purchaseOrder.istransport){
                    totalAmount += data.amount
                }else{
                    totalAmount += data.price
                }
                
                return data;
            });
            this.setState({purchaseOrderLine: result.data.Items, totalAmount: totalAmount})
        });
    }

    getPurchaseTransportManual () {
        this.setState({updateManualData: []})
        var params = {
            orderid:this.props.newId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetPurchaseTransportManual, params, headers)
        .then(result => {
            let totalManualAmount = 0;
            if(result.data.Items.length){
                result.data.Items.map((data, index)=>{
                        totalManualAmount += data.Amount
                    return data;
                });
                this.setState({purchaseTransportManualLine: result.data.Items, totalManualAmount: totalManualAmount})
            }
        });
    }
    
    componentWillUnmount() {
        this._isMounted = false
    }
    
    generatePurchaseInvoiceXmlExact = () => {
        this.setState({sendingFlag: true, exactFlag: false})
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            purchaseid: this.props.newId
        }
        Axios.post(API.PostPurchaseOrderExact, params, headers)
        .then(result => {
            if(result.data.Success){
                this.setState({exactFlag: true, sendingFlag: false});
            }
            // Axios.get(API.GeneratePurchaseInvoiceXmlExact, headers)
            // .then(result => {
            //     Axios.post(API.PostPurchaseOrderExactSend, params, headers)
            //     .then(result => {
            //         this.setState({exactFlag: true, sendingFlag: false})
            //     });
            // });
        });
    }

    transportManualLineEdit = (data) => {
        this.setState({updateManualData: data, showModalManully: true})
    }

    deletePurchaseTransportManual  = (Id) => {
        let params = {
            id: Id
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Sweetalert({
            title: "Are you sure?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
          })
          .then((willDelete) => {
            if (willDelete) {
                Axios.post(API.DeletePurchaseTransportManual, params, headers)
                .then(result => {
                    if(result.data.Success){
                        this.getPurchaseTransportManual();
                    }
                });
            } else {
            }
        });
    }

    deletePurchaseOrderLine = (id) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = {
            id: id
        }
        Axios.post(API.DeletePurchaseOrderLine, params, headers)
        .then(result => {
            if(result.data.Success){
                this.getPurchaseOrderLines();
            }
        });
    }

    downLoadFile = (fileId) => {
        window.open(API.GetDownloadFile+fileId);
    }

    onHide = () => {
        this.props.onGetgetPurchaseOrders();
        this.props.onHide();
        Common.hideSlideForm(); 
    }

    updownInfo = (id) =>{
        let purchaseOrderLine = this.state.purchaseOrderLine;
        purchaseOrderLine.map((data, i)=>{
            if(data.id===id){
                if(!data.checked){

                    data.checked = true;
                }else{
                    data.checked = false;
                }
            }
            return data;
        })
        this.setState({purchaseOrderLine: purchaseOrderLine});
    }

    newOrderRegistrate = (orderHeaderId) => {
        var re = new RegExp(/^.*\//);
        let path = re.exec(window.location.href);
        window.open(path+'sales-order/'+orderHeaderId, '_blank');
    }

    deleteSalesOrderDocment = (fileId) => {
        let params = {
            filestorageid: fileId
        }
        var header = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.DeletePurchaseDocument, params, header)
        .then(result=>{
            if(result.data.Success){
                this.getPurchaseOrder();
            }
        })
    }

    render () {
        let detailData = [];
        if(this.state.purchaseOrder){
            detailData = this.state.purchaseOrder;
        }
        let alltotal_Amounnt = this.state.totalAmount+this.state.totalManualAmount;
        const { purchaseOrderDocList } = this.state;
        return (
            <div className = "slide-form__controls open slide-product__detail">
                <div style={{marginBottom:30, padding:"0 20px"}}>
                    <i className="fas fa-times slide-close" style={{ fontSize: 20, cursor: 'pointer'}} onClick={()=>this.onHide()}></i>
                </div>
                <div className="content__header content__header--with-line product-detail__data--detail">
                    <h2 className="title">{trls("Purchase_Order_Details")}</h2>
                    <Button variant="primary" onClick={()=>this.generatePurchaseInvoiceXmlExact()} style={{marginLeft: 'auto'}}>{trls("Send_to_Exact")}</Button>
                </div>
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
                    <div style={{marginTop:10}}><Spinner animation="border" variant="info"/><span style={{marginTp:10, fontWeight: "bold", fontSize: 16}}> {trls('Sending')}...</span></div>
                )}
                <div className="place-and-orders__top">
                    <Row className="product-detail__data-div">
                        <Col sm={6}>
                            <Col style={{padding: 0}}>
                                <Form.Control type="text" readOnly defaultValue={detailData.Customer}/>
                                <label className="placeholder-label purhcase-placeholder">{trls('Supplier')}</label>
                            </Col>
                            <Col style={{display: 'flex', justifyContent: "space-between", padding: "20px 0px" }}>
                                <Col style={{paddingRight: 10, paddingLeft: 0}}>
                                    <Form.Control type="text" readOnly defaultValue={detailData.invoicenr}/>
                                    <label className="placeholder-label purhcase-placeholder">{trls('Invoice')}</label>
                                </Col>
                                <Col style={{paddingLeft: 10, paddingRight: 0}}>
                                    <Form.Control type="text" readOnly defaultValue={detailData.invoicedate ? Common.formatDate(detailData.invoicedate) : ''}/>
                                    <label className="placeholder-label" style={{left: "1.5em"}}>{trls('Invoice_date')}</label>
                                </Col>
                            </Col>
                            <Col style={{padding: 0}}>
                                <Form.Control type="text" readOnly defaultValue={detailData.description}/>
                                <label className="placeholder-label purhcase-placeholder">{trls('Description')}</label>
                            </Col>
                            <Col style={{padding: "20px 0px"}}>
                                {detailData &&(
                                    <Form.Check type="checkbox" label={trls("IsTransport")} disabled  defaultChecked={detailData.istransport} name="transport" />
                                )}
                            </Col>
                            <Col style={{padding: "20px 0px", paddingTop: 0}}>
                                <div id="react-file-drop-demo" className = "purhcase-order__doc">
                                    {purchaseOrderDocList.length>0&&(
                                        purchaseOrderDocList.map((data,i) =>(
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
                            <div>
                                <Button variant="light" style={{marginRight: 10}} onClick={()=>this.setState({modalShow:true, exactFlag: false})}><img src={require('../../assets/images/edit.svg')} alt="edit" style={{marginRight: 10}}></img>{trls('Edit_Purchase_detail')}</Button>
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className="product-detail-table">
                    <div className="product-price-table">
                        <div className="purchase-price__div">
                            <p className="purprice-title"><i className="fas fa-caret-right add-icon" style={{color: "#4697D1"}}></i>{trls("Products")}</p>
                            <Button variant="outline-secondary" style={{marginLeft: "auto"}} onClick={()=>this.setState({showModalPurchaase: true})}><i className="fas fa-plus add-icon"></i>{trls('Add_product')}</Button>
                        </div>
                        <div className="table-responsive prurprice-table__div">
                            {!this.state.purchaseOrder.istransport ? (
                                    <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                                        <thead>
                                            <tr>
                                                <th>{trls('Product')}</th>
                                                <th>{trls('Quantity')}</th>
                                                <th>{trls('Purchase_Unit')}</th>
                                                <th>{trls('Price')}</th>
                                                <th>{trls('Amount')}</th>
                                                <th>{trls('VATCode')}</th>
                                                <th>{trls('Reporting_Date')}</th>
                                                <th>{trls('Action')}</th>
                                                </tr>
                                        </thead>
                                        {this.state.purchaseOrderLine && (<tbody>
                                            {
                                                this.state.purchaseOrderLine.map((data,i)=>(
                                                    <React.Fragment key={i}>
                                                        <tr>
                                                            <td className={data.checked ? "order-product__td order-product__first-td" : ''}>{data.productcode}</td>
                                                            <td className={data.checked ? "order-product__td" : ''}>{data.quantity}</td>
                                                            <td className={data.checked ? "order-product__td" : ''}>{data.unit}</td>
                                                            <td className={data.checked ? "order-product__td" : ''}>{Common.formatMoney(data.price)}</td>
                                                            <td className={data.checked ? "order-product__td" : ''}>{Common.formatMoney(data.amount)}</td>
                                                            <td className={data.checked ? "order-product__td" : ''}>{data.VAT}</td>
                                                            <td className={data.checked ? "order-product__td" : ''}>{Common.formatDate(data.reportingdate)}</td>
                                                            <td className={data.checked ? "order-product__td order-product__last-td" : ''}>
                                                                <Row style={{justifyContent:"space-around", width: 250}}>
                                                                    <Button className="price-action__button" variant="light" onClick={()=>this.deletePurchaseOrderLine(data.id)}><i className="far fa-trash-alt add-icon" ></i>{trls('Delete')}</Button>
                                                                    <Button className="price-action__button" variant="light" onClick={()=>this.newOrderRegistrate(data.SalesOrderHeaderId)}><i className="fas fa-external-link-alt add-icon" ></i>{trls('Order')}</Button>
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
                                                                <td className={data.checked ? "order-product__last-td" : ''}></td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            }
                                            <tr style={{backgroundColor: '#D3EDD0', fontWeight: 'bold'}}>
                                                <td colSpan={8} style={{textAlign: 'right'}}><span className="purchase-child-total">{trls('Total')}</span><span className="purchase-child-total amount">{Common.formatMoney(this.state.totalAmount)}</span></td>
                                            </tr>
                                        </tbody>)}
                                    </table>
                                ):
                                    <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                                        <thead>
                                            <tr>
                                                <th>{trls('Pricingtype')}</th>
                                                <th>{trls('Price')}</th>
                                                <th>{trls('VATCode')}</th>
                                                <th>{trls('Action')}</th>
                                            </tr>
                                        </thead>
                                        {this.state.purchaseOrderLine && (<tbody>
                                            {
                                                this.state.purchaseOrderLine.map((data,i)=>(
                                                    <React.Fragment key={i}>
                                                        <tr>
                                                            <td className={data.checked ? "order-product__td order-product__first-td" : ''}>{data.pricingtype}</td>
                                                            <td className={data.checked ? "order-product__td" : ''}>{Common.formatMoney(data.price)}</td>
                                                            <td className={data.checked ? "order-product__td" : ''}>{data.VAT}</td>
                                                            <td className={data.checked ? "order-product__td order-product__last-td" : ''}>
                                                                <Row style={{justifyContent:"space-around", width: 150}}>
                                                                    <Button className="price-action__button" variant="light" onClick={()=>this.deletePurchaseOrderLine(data.id)}><i className="far fa-trash-alt add-icon" ></i>{trls('Delete')}</Button>
                                                                    <Button className="price-action__button" variant="light" onClick={()=>this.updownInfo(data.id)}><i className={data.checked ? "fas fa-caret-up" : "fas fa-caret-down"}></i></Button>
                                                                </Row>
                                                            </td>
                                                        </tr>
                                                        {data.checked && (
                                                            <tr>
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
                                                                <td className={data.checked ? "order-product__last-td" : ''}></td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))
                                            }
                                            <tr style={{backgroundColor: '#D3EDD0', fontWeight: 'bold'}}>
                                                <td colSpan={3} style={{textAlign: 'right'}}><span className="purchase-child-total">{trls('Total')}</span><span className="purchase-child-total amount">{Common.formatMoney(this.state.totalAmount)}</span></td>
                                                <td></td>
                                            </tr>
                                        </tbody>)}
                                    </table>
                                }
                        </div>
                    </div>
                    <div className="product-price-table">
                        <div className="purchase-price__div">
                            <p className="purprice-title"><i className="fas fa-caret-right add-icon" style={{color: "#4697D1"}}></i>{trls("Custom_products")}</p>
                            <Button variant="outline-secondary" style={{marginLeft: "auto"}} onClick={()=>this.setState({showModalManully: true})}><i className="fas fa-plus add-icon"></i>{trls('Add_product')}</Button>
                        </div>
                        <div className="table-responsive prurprice-table__div">
                        <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                                <thead>
                                    <tr>
                                        <th>{trls('Product')}</th>
                                        <th>{trls('Quantity')}</th>
                                        <th>{trls('Price')}</th>
                                        <th>{trls('Amount')}</th>
                                        <th>{trls('Reporting_Date')}</th>
                                        <th>{trls('Action')}</th>
                                    </tr>
                                </thead>
                                {this.state.purchaseTransportManualLine && (<tbody>
                                    {
                                        this.state.purchaseTransportManualLine.map((data,i) =>(
                                        <tr id={data.Id} key={i}>
                                            <td>{data.Product}</td>
                                            <td>{data.Quantity}</td>
                                            <td>{Common.formatMoney(data.Price)}</td>
                                            <td>{Common.formatMoney(data.Amount)}</td>
                                            <td>{Common.formatDate(data.ReportingDate)}</td>
                                            <td >
                                            <Row style={{justifyContent:"space-around"}}>
                                                <i id={data.Id} className="far fa-trash-alt statu-item" onClick={()=>this.deletePurchaseTransportManual(data.Id)}></i>
                                                <i id={data.Id} className="fas fa-pen statu-item" onClick={()=>this.transportManualLineEdit(data)} ></i>
                                            </Row>
                                        </td>
                                        </tr>
                                    ))
                                    }
                                    <tr style={{backgroundColor: '#D3EDD0', fontWeight: 'bold', fontSize: 13, lineHeight: 16}}>
                                        <td colSpan={6} style={{textAlign: 'right'}}><span className="purchase-child-total">{trls('Total')}</span><span className="purchase-child-total amount"> {Common.formatMoney(this.state.totalManualAmount)}</span></td>
                                    </tr>
                                </tbody>)}
                            </table>
                        </div>
                    </div>
                </div>
                <div className="purchase-amount" style={{textAlign: 'right', fontWeight: 'bold', padding: 10, marginBottom: 20, marginTop: 10, backgroundColor: '#609C5A'}}>
                    {trls('Total')}  <span >{Common.formatMoney(alltotal_Amounnt)}</span>
                </div>
                {this.state.purchaseOrder.id && (
                    <Updatepurchaseform
                        show={this.state.modalShow}
                        onHide={() => this.setState({modalShow: false})}
                        purchaseData={this.state.purchaseOrder}
                        getPurchaseOrder={()=>this.getPurchaseOrder()}
                    />
                )}
                <Addpurchaseform
                    show={this.state.showModalPurchaase}
                    onHide={() => this.setState({showModalPurchaase: false})}
                    suppliercode={this.state.supplierCode}
                    purchaseid={this.props.newId}
                    defaultVatCode={this.state.defaultVatCode}
                    vatCodeList={this.state.vatCodeList}
                    getPurchaseOrderLines={()=>this.getPurchaseOrderLines()}
                    transport={this.state.purchaseOrder.istransport}
                />
                <Addmanuallytranspor
                    show={this.state.showModalManully}
                    onHide={() => this.setState({showModalManully: false})}
                    reportingDate={detailData.invoicedate}
                    orderid={this.props.newId}
                    getPurchaseTransportManual={()=>this.getPurchaseTransportManual()}
                    updateData={this.state.updateManualData}
                />
            </div>
        )
        };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Purchaseorderdtail);
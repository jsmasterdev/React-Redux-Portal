import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import DatePicker from "react-datepicker";
import * as Common from '../../components/common';
import DraggableModalDialog from '../../components/draggablemodal';
import Addpriceform from '../Product/product_detailaddpriceform';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Addproduct extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            val1: '',
            productListData: [],
            purchasePrice: 0,
            salesPrice: 0,
            viewFieldFlag: false,
            purchaseAmount: 0,
            salesAmount: 0,
            productQuantity: 0,
            salesQuantity: 0,
            purchaseQuantity: 0,
            orderLineId: '',
            invoicedateflag: false,
            purchaseUnit: '',
            salesUnit: '',
            purhaseQuantityFlag: false,
            productId: '',
            loadProductFlag: false
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
        this.getProductList();
    }

    handleSubmit = (event) => {
        
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        let params = [];
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        if(!this.state.viewFieldFlag){
            params = {
                orderid: this.props.orderid,
                productid: data.product,
                quantity: data.salesquantity
            }
            Axios.post(API.PostSalesOrderLine, params, headers)
            .then(result => {
                this.setState({orderLineId: result.data.NewId, productid: data.product, viewFieldFlag: true})
            });
        }else{
            let transportData = []
            params = {
                purchasequantity: data.purchasequantity,
                salesquantity: data.salesquantity,
                orderlineid: this.state.orderLineId,
                purchasePrice: this.state.purchasePrice ? this.state.purchasePrice : '',
                salesPrice: this.state.salesPrice ? this.state.salesPrice : '',
                quantity: data.quantity,
                purchaseAmount: this.state.purchaseUnit===this.state.salesUnit && !this.state.purhaseQuantityFlag ? this.state.purchasePrice*this.state.salesQuantity : this.state.purchaseAmount,
                salesAmount: this.state.salesAmount,
                packingslip: data.packingslip,
                container: data.container,
                shipping: data.shippingdocumentnumber,
                reporting: Common.formatDateSecond(data.reporingdate)
            }
            Axios.post(API.PutSalesOrderLine, params, headers)
            .then(result => {
                transportData.productid=this.state.productid;
                transportData.packingslip=data.packingslip;
                transportData.container=data.container;
                transportData.shippingdocumentnumber=data.shippingdocumentnumber;
                transportData.quantity=data.salesquantity;
                transportData.salesOrderLineId=this.state.orderLineId;
                this.onHide();
                this.props.showTransportModal(transportData);
            });
        }
    }

    onHide = () => {
        this.setState({
            purchasePrice: 0,
            salesPrice: 0,
            viewFieldFlag: false,
            purchaseAmount: 0,
            salesAmount: 0,
            reportingDate: new Date(),
            productQuantity: 0,
            orderLineId: '',
            val1: '',
            purhaseQuantityFlag: false,
            productId: '',
            loadProductFlag: false
        })
        this.props.onHide();
        this.props.getSalesOrderLine();
    }

    getProductList = () =>{
        const { customercode, suppliercode, loadingdate, arrivaldate } = this.props;
        this._isMounted = true;
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            customercode: customercode,
            suppliercode: suppliercode,
            loadingdate: loadingdate==="1900-01-01T00:00:00" ? arrivaldate : loadingdate
        }
        if(this.props.customercode){
            Axios.post(API.GetSalesItems, params, headers)
            .then(result => {
                if(this._isMounted){
                    let product = result.data.Items.map( s => ({value:s.key,label: s.priceAvailable!=="True" ? <div>{s.value} <i className="fas fa-pen statu-item" style={{color: "#000", float: "right"}} onClick={()=>this.setState({showModalAddPrice: true, productId: s.key, loadProductFlag: true})}></i></div>:s.value, isDisabled: s.priceAvailable!=="True" ? true : false}));
                    this.setState({productListData: product});
                }
            });
        }else{
            Axios.get(API.GetProductsDropdown, headers)
            .then(result => {
                if(result.data.Success){
                    let productList = result.data.Items.filter((item, key)=>item.temporary);
                    let product = productList.map( s => ({value:s.key,label:s.value}));
                    this.setState({productListData: product});
                }
            });
        }
        
    }

    changeProduct = (val) => {
        this._isMounted = true;
        this.setState({val1: val.value});
        var headers = SessionManager.shared().getAuthorizationHeader();
        var purparams = {
            productid: val.value,
            loadingdate: this.props.loadingdate
        }
        var salparams = {
            productid: val.value,
            orderdate: this.props.loadingdate
        }
        var unitParams = {
            productid: val.value
        }
        Axios.post(API.GetPurchaseUnit, unitParams, headers)
        .then(result => {
            if(this._isMounted){
                this.setState({purchaseUnit: result.data.Items[0].Unit});
            }
        });
        Axios.post(API.GetSalesUnitData, unitParams, headers)
        .then(result => {
            if(this._isMounted){
                this.setState({salesUnit: result.data.Items[0].Unit});
            }
        });
        Axios.post(API.GetPurchasePrice, purparams, headers)
        .then(result => {
            if(this._isMounted){
                this.setState({purchasePrice: result.data.Items[0].price});
            }
        });
        Axios.post(API.GetSalesPrice, salparams, headers)
        .then(result => {
            if(this._isMounted){
                this.setState({salesPrice: result.data.Items[0].price});
            }
        });
    }

    changeQauntity = (event) => {
        this.setState({productQuantity: event.target.value})
    }

    changeSalesQauntity = (event) => {
        this.setState({salesQuantity: event.target.value, salesAmount: this.state.salesPrice*event.target.value})
    }

    changePurchaseQauntity = (event) => {
        this.setState({purchaseQuantity: event.target.value, purchaseAmount: this.state.purchasePrice*event.target.value, purhaseQuantityFlag: true})
    }

    onChangeDate = (date, e) => {
        if(e.type==="click"){
            this.setState({reportingDate: date, invoicedateflag: true})
        }
    }

    handleEnterKeyPress = (e) => {
        this.setState({flag: true});
        if(e.target.value.length===4){
            let today = new Date();
            let year = today.getFullYear();
            let date_day_month = e.target.value;
            let day = date_day_month.substring(0,2);
            let month = date_day_month.substring(2,4);
            let setDate = new Date(year + '-'+ month + '-' + day)
            this.setState({reportingDate:setDate, invoicedateflag: true})
        }
    }

    render(){
        let productListOption = this.state.productListData;
        return (
            <Modal
                show={this.props.show}
                dialogAs={DraggableModalDialog}
                onHide={()=>this.onHide()}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">    
                    {trls('Add')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Select
                                name="product"
                                options={productListOption}
                                onChange={val => this.changeProduct(val)}
                            />
                            <label className="placeholder-label">{trls('Product')}</label>
                           {!this.props.disabled && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0 }}
                                    value={this.state.val1}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    {!this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                <Form.Control type="number" name="salesquantity" required  step="0.001" placeholder={trls("Sales_Quantity")} onChange = {(val)=>this.changeSalesQauntity(val)} />
                                <label className="placeholder-label">{trls('Sales_Quantity')}</label>
                            </Col>
                        </Form.Group>
                    )}
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col sm={6} style={{padding: 0}}>
                            {this.state.viewFieldFlag&&(
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Col className="product-text">
                                        <Form.Control type="number" name="salesquantity" required step="0.001" defaultValue={this.state.salesQuantity} placeholder={trls("Sales_Quantity")} onChange = {(val)=>this.changeSalesQauntity(val)} />
                                        <label className="placeholder-label">{trls('Sales_Quantity')}</label>
                                    </Col>
                                </Form.Group>
                            )}
                            {this.state.viewFieldFlag&&(
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Col className="product-text">
                                        <Form.Control type="text" name="salesprice" defaultValue={Common.formatMoney(this.state.salesPrice)} readOnly placeholder={trls("Sales_Price")} />
                                        <label className="placeholder-label">{trls('Sales_Price')}</label>
                                    </Col>
                                </Form.Group>
                            )}
                            {this.state.viewFieldFlag&&(
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Col className="product-text">
                                        <Form.Control type="text" name="salesunit" defaultValue={this.state.salesUnit} readOnly placeholder={trls("Sales_Unit")} />
                                        <label className="placeholder-label">{trls('Sales_Unit')}</label>
                                    </Col>
                                </Form.Group>
                            )}
                            {this.state.viewFieldFlag&&(
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Col className="product-text">
                                        <Form.Control type="text" name="salesamount" value={Common.formatMoney(this.state.salesAmount)} readOnly placeholder={trls("Sales_Amount")} />
                                        <label className="placeholder-label">{trls('Sales_Amount')}</label>
                                    </Col>
                                </Form.Group>
                            )}
                        </Col>
                        <Col sm={6} style={{padding: 0}}>
                            {this.state.viewFieldFlag&&(
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Col className="product-text">
                                        {this.state.purchaseUnit===this.state.salesUnit?(
                                            <Form.Control type="number" name="purchasequantity" required step="0.001" defaultValue={this.state.salesQuantity}  placeholder={trls("Purchase_Quantity")} onChange = {(val)=>this.changePurchaseQauntity(val)} />
                                        ):
                                            <Form.Control type="number" name="purchasequantity" required step="0.001"  placeholder={trls("Purchase_Quantity")} onChange = {(val)=>this.changePurchaseQauntity(val)} />
                                        }
                                        <label className="placeholder-label">{trls('Purchase_Quantity')}</label>
                                    </Col>
                                </Form.Group>
                            )}
                            {this.state.viewFieldFlag&&(
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Col className="product-text"> 
                                        <Form.Control type="text" name="purchaseprice" defaultValue={Common.formatMoney(this.state.purchasePrice)} readOnly placeholder={trls("Purchase_Price")} />
                                        <label className="placeholder-label">{trls('Purchase_Price')}</label>
                                    </Col>
                                </Form.Group>
                            )}
                            {this.state.viewFieldFlag&&(
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Col className="product-text">
                                        <Form.Control type="text" name="purchaseunit" defaultValue={this.state.purchaseUnit} readOnly placeholder={trls("Purchase_Unit")} />
                                        <label className="placeholder-label">{trls('Purchase_Unit')}</label>
                                    </Col>
                                </Form.Group>
                            )}
                            {this.state.viewFieldFlag&&(
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Col className="product-text">
                                        {this.state.purchaseUnit===this.state.salesUnit && !this.state.purhaseQuantityFlag?(
                                            <Form.Control type="text" name="purhcaseamount" value={Common.formatMoney(this.state.purchasePrice*this.state.salesQuantity)} readOnly placeholder={trls("Purchase_Amount")} />
                                        ):
                                            <Form.Control type="text" name="purhcaseamount" value={Common.formatMoney(this.state.purchaseAmount)} readOnly placeholder={trls("Purchase_Amount")} />
                                        }
                                        <label className="placeholder-label">{trls('Purchase_Amount')}</label>
                                    </Col>
                                </Form.Group>
                            )}
                        </Col>
                    </Form.Group>
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                <Form.Control type="text" name="packingslip" placeholder={trls("Packing_slip_number")}/>
                                <label className="placeholder-label">{trls('Packing_slip_number')}</label>
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                <Form.Control type="text" name="container" placeholder={trls("Container_number")} />
                                <label className="placeholder-label">{trls('Container_number')}</label>
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                <Form.Control type="text" name="shippingdocumentnumber" placeholder={trls("ShippingDocumentnumber")} />
                                <label className="placeholder-label">{trls('ShippingDocumentnumber')}</label>
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Col className="product-text">
                                {this.state.invoicedateflag || !this.props.loadingdate? (
                                    <DatePicker name="reporingdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.state.reportingDate)} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>}/>
                                ) : <DatePicker name="reporingdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.props.loadingdate)} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>}/>
                                } 
                                <label className="placeholder-label">{trls('ReportingDate')}</label>
                            </Col>
                        </Form.Group>
                    )}
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                    </Form.Group>
                </Form>
                <Addpriceform
                    show={this.state.showModalAddPrice}
                    onHide={() => this.setState({showModalAddPrice: false})}
                    productid={this.state.productId}
                    loadproductflag={this.state.loadProductFlag}
                    onLoadProductFlag={()=>this.setState({loadProductFlag: false})}
                    onGetProductList={()=>this.getProductList()}
                />
            </Modal.Body>
        </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Addproduct);
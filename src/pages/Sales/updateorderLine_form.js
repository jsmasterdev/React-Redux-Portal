import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import * as Common from '../../components/common';

import DraggableModalDialog from '../../components/draggablemodal';

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Updateorderline extends Component {
    _isMounted = false;
    constructor() {
        super();
        this.state = {  
            reportingDate: new Date(),
            reportingFlag: false,
            editSalesFlag: false,
            editPurchaseFlag: false,
            editSalesQuantityFlag: false,
            editSalesPriceFlag: false,
            editPurchaseQuantityFlag: false,
            editPurchasePriceFlag: false,
            salesPrice: '',
            salesQuantity: '',
            purchasePrice: '',
            purchaseQuantity: '',
            salesAmount: '',
            purchaseAmount: ''

        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        // this.getProductList();
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
        params = {
            orderlineid: this.props.updatedata.id,
            salesquantity: data.salesquantity,
            purchasequantity: data.purchasequantity,
            // purchasePrice: this.props.updatedata.purchaseprice,
            // salesPrice: this.props.updatedata.SalesPrice,
            // purchaseAmount: this.props.updatedata.purchaseamount,
            // salesAmount: this.props.updatedata.SalesAmount,
            purchasePrice: data.purchaseprice.replace(',', '.'),
            salesPrice: data.salesprice.replace(',', '.'),
            // purchaseamount: data.purchaseamount,
            purchaseamount: this.state.editPurchaseFlag ? this.state.purchaseAmount : this.props.updatedata.purchaseamount,
            // salesAmount: data.salesamount,
            salesAmount: this.state.editSalesFlag ? this.state.salesAmount : this.props.updatedata.SalesAmount,
            packingslip: data.packingslip,
            container: data.container,
            shipping: data.shippingdocumentnumber,
            reporting: Common.formatDateSecond(data.reportdate)
        }
        Axios.post(API.PutSalesOrderLine, params, headers)
        .then(result => {
            this.onHide();
        });
    }

    onHide = () => {
        this.props.onHide();
        this.props.getSalesOrderLine();
    }

    onChangeDate = (date, e) => {
        if(e.type==="click"){
            this.setState({reportingDate: date, reportingFlag: true})
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
            this.setState({reportingDate:setDate, reportingFlag: true})
        }
    }
    changeSalesQuantity = (value) => {
        this.setState({salesAmount: this.state.editSalesPriceFlag ? this.state.salesPrice*value : this.props.updatedata.SalesPrice*value, salesQuantity: value, editSalesQuantityFlag: true, editSalesFlag: true})
    }

    changeSalesPrice = (val) => {
        let value = val.replace(',', '.');
        this.setState({salesAmount: this.state.editSalesQuantityFlag ? this.state.salesQuantity*value : this.props.updatedata.salesquantity*value, salesPrice: value, editSalesPriceFlag: true, editSalesFlag: true}) 
    }

    changePurchaseQuantity = (value) => {
        this.setState({purchaseAmount: this.state.editPurchasePriceFlag ? this.state.purchasePrice*value : this.props.updatedata.purchaseprice*value, purchaseQuantity: value, editPurchaseQuantityFlag: true, editPurchaseFlag: true})
    }

    changePurchasePrice = (val) => {
        let value = val.replace(',', '.');
        this.setState({purchaseAmount: this.state.editPurchaseQuantityFlag ? this.state.purchaseQuantity*value : this.props.updatedata.purchasequantity*value, purchasePrice: value, editPurchasePriceFlag: true, editPurchaseFlag: true}) 
    }

    render(){
        let updateData = [];
        if(this.props.updatedata){
            updateData = this.props.updatedata;
        }
        
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
                    {trls('Edit')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="text" name="product" required defaultValue={updateData.productcode} placeholder={trls("Purchase_Price")} />
                            <label className="placeholder-label">{trls('Product')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="number" name="salesquantity" required defaultValue={updateData.salesquantity} placeholder={trls("Purchase_Price")} onChange={(evt)=>this.changeSalesQuantity(evt.target.value)}/>
                            <label className="placeholder-label">{trls('Sales_Quantity')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="salesprice" required defaultValue={updateData.SalesPrice} placeholder={trls("Sales_Price")} onChange={(evt)=>this.changeSalesPrice(evt.target.value)} />
                            <label className="placeholder-label">{trls('Sales_Price')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="number" name="purchasequantity" required defaultValue={updateData.purchasequantity} placeholder={trls("Purchase_Price")} onChange={(evt)=>this.changePurchaseQuantity(evt.target.value)} />
                            <label className="placeholder-label">{trls('Purchase_Quantity')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="text" name="purchaseprice" defaultValue={updateData.purchaseprice} placeholder={trls("Purchase_Price")} onChange={(evt)=>this.changePurchasePrice(evt.target.value)} />
                            <label className="placeholder-label">{trls('Purchase_Price')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="text" name="purchaseprice" defaultValue={updateData.PurchaseUnit} placeholder={trls("Purchase_Price")} />
                            <label className="placeholder-label">{trls('Purchase_Unit')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="salesprice" defaultValue={updateData.SalesUnit} placeholder={trls("Sales_Price")} />
                            <label className="placeholder-label">{trls('Sales_Unit')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            {/* <Form.Control type="text" name="salesamount" readOnly defaultValue={Common.formatMoney(updateData.SalesAmount)} placeholder={trls("Sales_Amount")} /> */}
                            {!this.state.editSalesFlag?(
                                <Form.Control type="text" name="salesamount" readOnly required placeholder={trls("Sales_Amount")} value={updateData.SalesAmount ? Common.formatMoney(updateData.SalesAmount): ''}/>
                            ):
                                <Form.Control type="text" name="salesamount" readOnly required placeholder={trls("Sales_Amount")} value={Common.formatMoney(this.state.salesAmount)}/>
                            }
                            <label className="placeholder-label">{trls('Sales_Amount')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            {!this.state.editPurchaseFlag?(
                                <Form.Control type="text" name="purchaseamount" readOnly required placeholder={trls("Purchase_Amount")} value={updateData.purchaseamount ? Common.formatMoney(updateData.purchaseamount): ''}/>
                            ):
                                <Form.Control type="text" name="purchaseamount" readOnly required placeholder={trls("Purchase_Amount")} value={Common.formatMoney(this.state.purchaseAmount)}/>
                            }
                            <label className="placeholder-label">{trls('Purchase_Amount')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="packingslip" defaultValue={updateData.PackingSlip}  placeholder={trls("Packing_slip_number")} />
                            <label className="placeholder-label">{trls('Packing_slip_number')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="container" defaultValue={updateData.Container} placeholder={trls("Container_number")} />
                            <label className="placeholder-label">{trls('Container_number')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="shippingdocumentnumber" defaultValue={updateData.Shipping} placeholder={trls("ShippingDocumentnumber")} />
                            <label className="placeholder-label">{trls('ShippingDocumentnumber')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            {/* {this.state.reportingDateFlag || !this.props.updateData.ReportingDate ?( 
                                <DatePicker name="reporingdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={updateData.reportingDate} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>} />
                                ) : <DatePicker name="reporingdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date( updateData.ReportingDate)} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>} />
                            }  */}

                            {this.state.reportingFlag || !updateData.ReportingDate ? (
                                <DatePicker name="reportdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={!this.state.reportingFlag ? new Date(updateData.ReportingDate):this.state.reportingDate} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>}/>
                            ) : <DatePicker name="reportdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(updateData.ReportingDate)} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>}/>
                            }
                            <label className="placeholder-label">{trls('ReportingDate')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Updateorderline);
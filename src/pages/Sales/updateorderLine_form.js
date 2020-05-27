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
    constructor(props) {
        super(props);
        this.state = {  
            reportingDate: new Date(),
            reportingFlag: false
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
            purchasePrice: Common.formatMoneyAmount(data.purchaseprice),
            salesPrice: Common.formatMoneyAmount(data.salesprice),
            purchaseAmount: Common.formatMoneyAmount(data.purhcaseamount),
            salesAmount: Common.formatMoneyAmount(data.salesamount),
            packingslip: data.packingslip,
            container: data.container,
            shipping: data.shippingdocumentnumber,
            reporting: Common.formatDateSecond(data.reporingdate)
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
                            <Form.Control type="text" name="product" defaultValue={updateData.productcode} readOnly placeholder={trls("Purchase_Price")} />
                            <label className="placeholder-label">{trls('Product')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="text" name="salesquantity" defaultValue={updateData.salesquantity} readOnly  placeholder={trls("Purchase_Price")} />
                            <label className="placeholder-label">{trls('Sales_Quantity')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="text" name="purchasequantity" defaultValue={updateData.purchasequantity} readOnly placeholder={trls("Purchase_Price")} />
                            <label className="placeholder-label">{trls('Purchase_Quantity')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="text" name="purchaseprice" defaultValue={Common.formatMoney(updateData.purchaseprice)} readOnly placeholder={trls("Purchase_Price")} />
                            <label className="placeholder-label">{trls('Purchase_Price')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="salesprice" defaultValue={Common.formatMoney(updateData.SalesPrice)} readOnly placeholder={trls("Sales_Price")} />
                            <label className="placeholder-label">{trls('Sales_Price')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text"> 
                            <Form.Control type="text" name="purchaseprice" defaultValue={updateData.PurchaseUnit} readOnly placeholder={trls("Purchase_Price")} />
                            <label className="placeholder-label">{trls('Purchase_Unit')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="salesprice" defaultValue={updateData.SalesUnit} readOnly placeholder={trls("Sales_Price")} />
                            <label className="placeholder-label">{trls('Sales_Unit')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="purhcaseamount" defaultValue={Common.formatMoney(updateData.purchaseamount)} readOnly placeholder={trls("Purchase_Amount")} />
                            <label className="placeholder-label">{trls('Purchase_Amount')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="salesamount" defaultValue={Common.formatMoney(updateData.SalesAmount)} readOnly placeholder={trls("Sales_Amount")} />
                            <label className="placeholder-label">{trls('Sales_Amount')}</label>
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
                            {this.state.reportingFlag || !this.props.updatedata ?( 
                                <DatePicker name="reporingdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.reportingDate} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>} />
                                ) : <DatePicker name="reporingdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date( this.props.updatedata.ReportingDate)} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>} />
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
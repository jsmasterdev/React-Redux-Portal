import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import DraggableModalDialog from '../../components/draggablemodal';
import DatePicker from "react-datepicker";
import * as Common from '../../components/common'


const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Addmanuallytransport extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            productListData: [],
            reportingDate: new Date(),
            price: 0,
            quantity: 0,
            amount: 0,
            vatListData: [],
            val1: '',
            val2: '',
            editFlag: false,
            reportingDateFlag: false,
            editPriceFlag: false, 
            editQuantityFlag: false
        };
    }
    
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
        this.getProductsList();
        this.getVatList();
    }

    handleSubmit = (event) => {
        this.setState({searchFlag: true})
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        let params = [];
        let URL = '';
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        if(!this.props.updateData.Id){
            params = {
                orderid: this.props.orderid,
                product: data.product,
                quantity: data.quantity,
                price: data.price,
                amount: this.state.amount,
                reportingdate: Common.formatDateSecond(data.reportdate),
                description: data.description,
                vat: data.vat
            }
            URL = API.PostPurchaseTransportManual;
        }else{
            params = {
                id: this.props.updateData.Id,
                product: data.product,
                quantity: data.quantity,
                price: data.price,
                amount: this.state.editFlag ? this.state.amount : this.props.updateData.Amount,
                reportingdate: Common.formatDateSecond(data.reportdate),
                description: data.description,
                vat: data.vat
            }
            URL = API.PutPurchaseTransportManual;
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(URL, params, headers)
        .then(result => {
            if(result.data.Success){
                this.onHide();
            }
        });
    }

    getProductsList = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetProductsDropdown, headers)
        .then(result => {
            if(result.data.Success){
                let product = result.data.Items.map( s => ({value:s.key,label:s.value}));
                this.setState({productListData: product});
            }
        });
    }

    getVatList = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetVATCode, headers)
        .then(result => {
            if(result.data.Success){
                let vatCode = result.data.Items.map( s => ({value:s.key,label:s.value}));
                this.setState({vatListData: vatCode});
            }
        });
    }

    onHide = () => {
        this.setState({
            reportingDate: new Date(),
            price: 0,
            quantity: 0,
            amount: 0,
            val1: '',
            val2: '',
            editFlag: false,
            reportingDateFlag: false,
            editQuantityFlag: false,
            editPriceFlag: false
        })
        this.props.onHide();
        this.props.getPurchaseTransportManual();
    }

    changeQuantity = (value) => {
        this.setState({amount: this.state.editPriceFlag ? this.state.price*value : this.props.updateData.Price*value, quantity: value, editQuantityFlag: true, editFlag: true})
    }

    changePrice = (value) => {
        this.setState({amount: this.state.editQuantityFlag ? this.state.quantity*value : this.props.updateData.Quantity*value, price: value, editPriceFlag: true, editFlag: true}) 
    }

    onChangeDate = (date, e) => {
        if(e.type==="click"){
            this.setState({reportingDate: date, reportingDateFlag: true})
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
            this.setState({reportingDate: setDate, reportingDateFlag: true})
        }
    }

    render(){
        return (
            <Modal
                dialogAs={DraggableModalDialog} 
                show={this.props.show}
                onHide={()=>this.onHide()}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {!this.props.updateData.Id ? trls('Manual'): trls('Manual_Edit')}                   
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls('Products')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            {this.props.updateData.ProductId?(
                                <Select
                                    name="product"
                                    options={this.state.productListData}
                                    onChange={val => this.setState({val1: val.value})}
                                    defaultValue={{'value': this.props.updateData.ProductId, 'label': this.props.updateData.Product}}
                                />
                            ): 
                                <Select
                                    name="product"
                                    options={this.state.productListData}
                                    onChange={val => this.setState({val1: val.value})}
                                />
                            }
                            
                            {!this.props.disabled && !this.props.updateData.ProductId && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: "100%" }}
                                    value={this.state.val1}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Quantity")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="quantity" required placeholder={trls("Quantity")} defaultValue={this.props.updateData.Quantity} onChange={(evt)=>this.changeQuantity(evt.target.value)}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Price")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="price" required placeholder={trls("Price")} defaultValue={this.props.updateData.Price} onChange={(evt)=>this.changePrice(evt.target.value)}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Amount")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            {!this.state.editFlag?(
                                <Form.Control type="text" name="amount" disabled required placeholder={trls("Amount")} value={this.props.updateData.Amount ? Common.formatMoney(this.props.updateData.Amount): ''}/>
                            ):
                                <Form.Control type="text" name="amount" disabled required placeholder={trls("Amount")} value={Common.formatMoney(this.state.amount)}/>
                            }
                            
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("ReportingDate")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            {this.state.reportingDateFlag || !this.props.updateData.ReportingDate ? (
                                <DatePicker name="reportdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={!this.state.reportingDateFlag ? new Date(this.props.reportingDate):this.state.reportingDate} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>}/>
                            ) : <DatePicker name="reportdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.props.updateData.ReportingDate)} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>}/>
                            }
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Description")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="description" required defaultValue={this.props.updateData.description} placeholder={trls("Description")}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls('Vat')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            {this.props.updateData.VatId?(
                                <Select
                                    name="vat"
                                    options={this.state.vatListData}
                                    onChange={val => this.setState({val2: val.value})}
                                    className="select-vat-class"
                                    defaultValue={{'value': this.props.updateData.VatId, 'label': this.props.updateData.VAT}}
                                />
                            ):
                                <Select
                                    name="vat"
                                    options={this.state.vatListData}
                                    className="select-vat-class"
                                    onChange={val => this.setState({val2: val.value})}
                                />
                            }
                            
                            {!this.props.disabled && !this.props.updateData.VatId &&  (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0, width: "100%"}}
                                    value={this.state.val2}
                                    required
                                />
                            )}
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
export default connect(mapStateToProps, mapDispatchToProps)(Addmanuallytransport);
    
import React, {Component} from 'react'
import { Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import * as salesAction  from '../../actions/salesAction';
import DatePicker from "react-datepicker";
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import $ from 'jquery';
import * as Auth   from '../../components/auth';
import FileDrop from 'react-file-drop';
import * as Common from '../../components/common';
import Sweetalert from 'sweetalert';

const mapStateToProps = state => ({ 
    ...state.auth,
    customerData: state.common.customerData,

});

const mapDispatchToProps = (dispatch) => ({
    getCustomer: () =>
        dispatch(salesAction.getCustomerData()),
    saveSalesOder: (params) =>
        dispatch(salesAction.saveSalesOrder(params))
});
class Purchaseform extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            invoicedate: new Date(), 
            invoicedateflag: false,
            expirationdateflag: false,
            purchaseid: '',
            supplier: [],
            journa: [],
            expirationdate: new Date(),
            val1: '',
            val2: '',
            files: [],
            checkFlag: false,
            setSupplierCode: '',
            setDescription: ''
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this.getSupplierList();
        this.getTransportersList();     
    }

    getSupplierList = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetSuppliersDropdown, headers)
        .then(result => {
            this.setState({supplier: result.data.Items.map( s => ({value:s.key,label:s.value}))});
        });
    };

    getTransportersList = () => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetTransportersDropdown, headers)
        .then(result => {
            this.setState({transport: result.data.Items.map( s => ({value:s.Key,label:s.Value}))});
        });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        let params = {};
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        params = {
            supplier: this.state.setSupplierCode,
            invoice: data.invoicenr
        }
        Axios.post(API.CheckMultipleInvoice, params, headers)
        .then(result => {
            if(result.data.Items){
                if(result.data.Items[0].multipleinvoice === "true") {
                    Sweetalert(trls('already_invoice'));
                    return;
                }else{
                    if(!this.props.purchaseData){
                        params = {
                            "supplier": data.supplier,
                            "invoicenr": data.invoicenr,
                            "invoicedate": Common.formatDateSecond(data.invoicedate),
                            "description": data.description,
                            "transport": data.transport==="on"?true: false
                        }
                        Axios.post(API.PostPurchaseOrder, params, headers)
                        .then(result => {
                            this.fileUploadData(result.data.NewId);
                        });
                    }else{
                        params = {
                            "id": this.props.purchaseData.id,
                            "suppliercode": data.supplier,
                            "invoicenr": data.invoicenr,
                            "invoicedate": Common.formatDateSecond(data.invoicedate),
                            "description": data.description,
                            "istransport": data.transport==="on"?true: false
                        }
                        Axios.post(API.PutPurchaseOrder+'?id='+this.props.purchaseData.id, params, headers)
                        .then(result => {
                            this.fileUploadData(this.props.purchaseData.id);
                        });
                    }
                }
            }
        });
    }

    openUploadFile = () =>{
        $('#inputFile').show();
        $('#inputFile').focus();
        $('#inputFile').click();
        $('#inputFile').hide();
    }
    
    onChange = (e) => {
        let fileData = this.state.files;
        fileData.push(e.target.files[0]);
        this.setState({files: fileData});
    }

    fileUploadData = (purchaseid) => {
        this._isMounted = true;
        let fileArray = this.state.files
        let documentParam = [];
        let k = 1;
        let fileLength = fileArray.length;
        if(fileLength!==0){
            fileArray.map((file, index)=>{
                var formData = new FormData();
                formData.append('file', file);// file from input
                var headers = {
                    "headers": {
                        "Authorization": "bearer "+Auth.getUserToken(),
                    }
                }
                Axios.post(API.FileUpload, formData, headers)
                .then(result => {
                    documentParam = {
                        purchaseid: purchaseid,
                        fileid: result.data.Id
                    }
                    Axios.post(API.PostPurchaseDocument, documentParam, headers)
                    .then(result=>{
                        if(this._isMounted){
                            if(k===fileLength){
                                this.props.onHide();
                                Common.hideSlideForm();
                                if(!this.props.purchaseData){
                                    this.props.onloadPurchaseDetail(purchaseid);
                                }else{
                                    this.props.getPurchaseOrder();
                                }
                            }
                            k++;
                        }
                    })
                })
                return fileArray;
            });
        }else{
            this.props.onHide();
            Common.hideSlideForm();
            if(!this.props.purchaseData){
                this.props.onloadPurchaseDetail(purchaseid);
            }else{
                this.props.getPurchaseOrder();
            }
        }
        
    }

    handleDrop = (files, event) => {
        let fileData = this.state.files;
        for(var i=0; i<files.length; i++){
            fileData.push(files[i]);
        }
        this.setState({files: fileData});
    }

    getjournalData = () => {
        let journa = [];
        let journalData = this.state.journa;
        if(this.props.purchaseData){
            journalData.map((journal, index)=>{
                if(journal.key===this.props.purchaseData.journal){
                    journa = { "label": journal.value , "value": journal.key }
                }
                return journalData;
            });
        }
        return journa
    }

    getSupplierData = () => {
        let supplierData = [];
        let supplierSelect = [];
        if(this.props.purchaseData){
            if(this.props.purchaseData.istransport){
                supplierData = this.state.transport;
                if(supplierData){
                    supplierData.map((supplier, index)=>{
                        if(supplier.label===this.props.purchaseData.Customer){
                            supplierSelect = supplier
                        }
                        return supplierData;
                    });
                }
                
            }else{
                supplierData = this.state.supplier;
                if(supplierData){
                    supplierData.map((supplier, index)=>{
                        if(supplier.label===this.props.purchaseData.Customer){
                            supplierSelect = supplier
                        }
                        return supplierData;
                    });
                }
                
            }
        }
        return supplierSelect;
    }

    transportInvoice = (event) => {
        this.setState({checkFlag: true, val1: ''})
        if(event.target.checked){
            this.setState({transportFlag: true})
        }else{
            this.setState({transportFlag: false})
        }
    }

    onChangeDate = (date, e) => {
        if(e.type==="click"){
            this.setState({invoicedate: date, invoicedateflag: true})
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
            this.setState({invoicedate: setDate, invoicedateflag: true})
        }
    }

    changeSupplier = (val) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        let params = {
            supplier: val.value
        }
        Axios.post(API.GetSupplierDescription, params, headers)
        .then(result => {
            if(result.data.Items.length){
                this.setState({setDescription: result.data.Items[0].Description})
            }else{
                this.setState({setDescription: ''})
            }
        });
        this.setState({val1:val, setSupplierCode: val.value})
    }

    onHide = () => {
        this.props.onHide();
        Common.hideSlideForm();
    }

    render(){   
        let fileData = this.state.files;
        let purchaseData = [];
        if(this.props.purchaseData){
            purchaseData = this.props.purchaseData;
        }
        return (
            <div className = "slide-form__controls open" style={{height: "100%"}}>
                <div style={{marginBottom:30}}>
                    <i className="fas fa-times slide-close" style={{ fontSize: 20, cursor: 'pointer'}} onClick={()=>this.onHide()}></i>
                </div>
                <Form className="container" onSubmit = { this.handleSubmit }>
                    <Col className="title add-product">{trls('Add_purchase')}</Col>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls('IsTransport')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            {!this.props.purchaseData ? (
                                <Form.Check type="checkbox" style={{marginTop: 8}} defaultChecked = {purchaseData.istransport} onChange={(val)=>this.transportInvoice(val)} name="transport" />
                            ): 
                            <Form.Check type="checkbox" style={{marginTop: 8}} disabled defaultChecked = {purchaseData.istransport} onChange={(val)=>this.transportInvoice(val)} name="transport" />
                            }
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        {!this.props.purchaseData&&(
                            <Col>
                                {!this.state.transportFlag ?(
                                    <Select
                                        name="supplier"
                                        placeholder={trls('Supplier')}
                                        options={this.state.supplier}
                                        // onChange={val => this.setState({val1:val, setSupplierCode: val.value})}
                                        onChange={val => this.changeSupplier(val)}
                                        defaultValue = {this.getSupplierData()}
                                    />
                                ):
                                    <Select
                                        name="supplier"
                                        placeholder={trls('Supplier')}
                                        options={this.state.transport}
                                        onChange={val => this.changeSupplier(val)}
                                        // onChange={val => this.setState({val1:val, setSupplierCode: val.value})}
                                        defaultValue = {this.getSupplierData()}
                                    />
                                }
                                <label className="placeholder-label">{trls('Supplier')}</label>
                                {!this.props.disabled && !this.props.purchaseData && (
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
                        )}
                        {this.props.purchaseData&&(
                            <Col sm="9" className="product-text">
                                {!this.state.checkFlag && !this.props.purchaseData.istransport && (
                                    <Select
                                        name="supplier"
                                        placeholder={trls('Supplier')}
                                        options={this.state.supplier}
                                        onChange={val => this.setState({val1:val, setSupplierCode: val.value})}
                                        defaultValue = {this.getSupplierData()}
                                    />
                                )
                                }
                                {!this.state.checkFlag && this.props.purchaseData.istransport && (
                                    <Select
                                        name="supplier"
                                        placeholder={trls('Supplier')}
                                        options={this.state.transport}
                                        onChange={val => this.setState({val1:val, setSupplierCode: val.value})}
                                        defaultValue = {this.getSupplierData()}
                                    />
                                )
                                }
                                {this.state.checkFlag && !this.state.transportFlag && (
                                    <Select
                                        name="supplier"
                                        placeholder={trls('Supplier')}
                                        options={this.state.supplier}
                                        onChange={val => this.setState({val1:val, setSupplierCode: val.value})}
                                        defaultValue = {this.getSupplierData()}
                                    />
                                )
                                }
                                {this.state.checkFlag && this.state.transportFlag && (
                                    <Select
                                        name="supplier"
                                        placeholder={trls('Supplier')}
                                        options={this.state.transport}
                                        onChange={val => this.setState({val1:val, setSupplierCode: val.value})}
                                        defaultValue = {this.getSupplierData()}
                                    />
                                )
                                }
                                <label className="placeholder-label">{trls('Supplier')}</label>
                                { !this.props.purchaseData || this.state.checkFlag ? (
                                    <input
                                        onChange={val=>console.log()}
                                        tabIndex={-1}
                                        autoComplete="off"
                                        style={{ opacity: 0, height: 0 }}
                                        value={this.state.val1}
                                        required
                                        />
                                    ):<div></div>}
                            </Col>
                        )}
                        
                    </Form.Group>
                    <Form.Group className="product-text" as={Row} controlId="formPlaintextPassword">
                        <Col>
                            <Form.Control type="text" name="invoicenr" defaultValue = {purchaseData.invoicenr} required placeholder={trls('Invoice')} />
                            <label className="placeholder-label">{trls('Invoice')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            {this.state.invoicedateflag || !this.props.purchaseData? (
                                <DatePicker name="invoicedate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.invoicedate} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>} />
                            ) : <DatePicker name="invoicedate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.props.purchaseData.invoicedate)} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>}  />
                            } 
                            <label className="placeholder-label">{trls('Invoice_date')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Col className="product-text">
                            <Form.Control type="text" name="description" defaultValue = {this.state.setDescription} required placeholder={trls("Description")} />
                            <label className="placeholder-label">{trls('Description')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Col className="product-text input-div" style={{height: "auto"}}>
                            <div id="react-file-drop-demo" style={{border: '1px solid #ced4da', color: 'black', padding: 7, borderRadius: 3, minHeight: 40 }}>
                                <FileDrop onDrop={this.handleDrop}>
                                    {fileData.length>0?(
                                        fileData.map((data,i) =>(
                                            <div id={i} key={i} style={{cursor: "pointer"}} onClick={()=>this.openUploadFile()}>
                                                {data.name}
                                            </div>
                                        ))
                                    ):
                                        <div style={{cursor: "pointer"}} onClick={()=>this.openUploadFile()}>{trls("Click_or_Drop")}</div> 
                                    }
                                     <input id="inputFile" name="file" type="file" accept="*.*"  onChange={this.onChange} style={{display: "none"}} />   
                                </FileDrop>
                            </div>
                            <label className="placeholder-label">{trls('File')}</label>
                        </Col>
                    </Form.Group>
                    <Form.Group>
                        <Col>
                            <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                        </Col>
                    </Form.Group>
                </Form>
            </div>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Purchaseform);
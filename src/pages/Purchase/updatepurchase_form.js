import React, {Component} from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { connect } from 'react-redux';
import * as salesAction  from '../../actions/salesAction';
import DatePicker from "react-datepicker";
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import history from '../../history';
import { trls } from '../../components/translate';
import $ from 'jquery';
import * as Auth   from '../../components/auth';
import FileDrop from 'react-file-drop';
import * as Common from '../../components/common';
import DraggableModalDialog from '../../components/draggablemodal';
import Sweetalert from 'sweetalert';
import Pageloadspiiner from '../../components/page_load_spinner';

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

class Purchaseupdateform extends Component {
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
            pageLodingFlag: false
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        // $("#myModal").draggable({
        //     handle: ".modal-header"
        // });
      
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
        this.setState({pageLodingFlag: true});
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
                if(result.data.Items[0].multipleinvoice === "true"){
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
        })
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
        let fileLength = fileArray.length;
        let k = 1;
        if(fileLength>0){
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
                            if(fileLength === k){
                                this.props.onHide();
                                this.setState({pageLodingFlag: false});
                                if(!this.props.purchaseData){
                                    history.push('/purchase-order-detail',{ newId: purchaseid, supplierCode:this.state.val1.value, newSubmit:false});
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
            this.setState({pageLodingFlag: false});
            if(!this.props.purchaseData){
                history.push('/purchase-order-detail',{ newId: purchaseid, supplierCode:this.state.val1.value, newSubmit:false});
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

    render(){   
        let fileData = this.state.files;
        let purchaseData = [];
        if(this.props.purchaseData){
            purchaseData = this.props.purchaseData;
        }
        const { pageLodingFlag } = this.state;
        return (
            <Modal
                // id={"myModal"}
                dialogAs={DraggableModalDialog}
                show={this.props.show}
                onHide={this.props.onHide}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {!this.props.purchaseData?(
                        trls('Purchase_Order')
                    ):trls('Edit')}
                    
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
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
                        <Form.Label column sm="3">
                            {trls('Supplier')} 
                        </Form.Label>
                        {!this.props.purchaseData&&(
                            <Col sm="9" className="product-text">
                                {!this.state.transportFlag ?(
                                    <Select
                                        name="supplier"
                                        placeholder={trls('Supplier')}
                                        options={this.state.supplier}
                                        onChange={val => this.setState({val1:val, setSupplierCode: val.value})}
                                        defaultValue = {this.getSupplierData()}
                                    />
                                ):
                                    <Select
                                        name="supplier"
                                        placeholder={trls('Supplier')}
                                        options={this.state.transport}
                                        onChange={val => this.setState({val1:val, setSupplierCode: val.value})}
                                        defaultValue = {this.getSupplierData()}
                                    />
                                }
                                
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
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls('Invoice')}    
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="invoicenr" defaultValue = {purchaseData.invoicenr} required placeholder="Invoicenr " />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls('Invoice_date')}   
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            {this.state.invoicedateflag || !this.props.purchaseData? (
                                <DatePicker name="invoicedate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.invoicedate} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>} />
                            ) : <DatePicker name="invoicedate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.props.purchaseData.invoicedate)} onChange = {(value, e)=>this.onChangeDate(value, e)} customInput={<input onKeyUp={(event)=>this.handleEnterKeyPress(event)}/>}  />
                            } 
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls('Description')}
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="text" name="description" defaultValue = {purchaseData.description} required placeholder="Description  " />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextSupplier">
                        <Form.Label column sm="3" >
                            {trls('File')}   
                        </Form.Label>
                        <Col sm="9" className="product-text input-div" style={{height: "auto"}}>
                            <div id="react-file-drop-demo" style={{border: '1px solid #ced4da', color: 'black', padding: 7, borderRadius: 3 }}>
                                <FileDrop onDrop={this.handleDrop}>
                                    {fileData.length>0?(
                                        fileData.map((data,i) =>(
                                            <div id={i} key={i} style={{cursor: "pointer"}} onClick={()=>this.openUploadFile()}>
                                                {data.name ? data.name : ''}
                                            </div>
                                        ))
                                    ):
                                        <div style={{cursor: "pointer"}} onClick={()=>this.openUploadFile()}>{trls("Click_or_Drop")}</div> 
                                    }
                                     <input id="inputFile" name="file" type="file" accept="*.*"  onChange={this.onChange} style={{display: "none"}} />   
                                </FileDrop>
                            </div>
                        </Col>
                    </Form.Group>
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Pageloadspiiner loading = {pageLodingFlag}/>
        </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Purchaseupdateform);
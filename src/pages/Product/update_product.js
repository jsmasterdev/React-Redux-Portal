import React, {Component} from 'react'
import { Form, Row, Col} from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { trls } from '../../components/translate';
import Select from 'react-select';
import 'datatables.net';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Customernote from '../../components/customer_note';
import DraggableModalDialog from '../../components/draggablemodal';

class Updateproductform extends Component {
    _isMounted = false;
      constructor(props) {
          super(props);
          this.state = {  
              token: "",
              customerData: [],
              supplier: [],
              productType: [],
              customer: [],
              salesUnit: [],
              productGroup: [],
              purchaseUnit: [],
              modalShow: false,
              appprover: [],
              val1:"",
              val2:"",
              val3:"",
              val4:"",
              val5:"",
              val6:"",
              redirect:false,
              product_id:"",
              loading:true
          };
        }
      componentWillUnmount() {
        this._isMounted = false;
      }

      componentDidMount() {
        this.getSupplierList();
        this.getProducttype();
        this.getCustomer();
        // this.getSalesunit();
        this.getProductGroup();
        this.getUnitData();
        this.getUserData();
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
            this.setState({approver:optionarray})
          });
      }

      getSupplierList = () =>{
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetSupplierList, headers)
        .then(result => {
            this.setState({supplier: result.data.Items})
        });
      }

      getUnitData = () =>{
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetUnitData, headers)
        .then(result => {
            this.setState({purchaseUnit: result.data.Items})
            this.setState({salesUnit: result.data.Items})
        });
      }

      getProducttype = () =>{
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetProductType, headers)
        .then(result => {
            this.setState({productType: result.data.Items})
        });
      }

      getCustomer = () =>{
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetCustomerData, headers)
        .then(result => {
            this.setState({customer: result.data.Items})
        });
      }

      getProductGroup = () =>{
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetProductGroup, headers)
        .then(result => {
            this.setState({productGroup: result.data.Items})
        });
      }

      handleSubmit = (event) => {
       
          event.preventDefault();
          const clientFormData = new FormData(event.target);
          const data = {};
          for (let key of clientFormData.keys()) {
          data[key] = clientFormData.get(key);
          }
          let params = {
            "supplier":data.Supplier,
            "customer": data.Customer,
            "product": data.product,
            "description": data.Description,
            "salesunit": data.Salesunit,
            "productgroup": data.Productgroup,
            "kilogram":data.kilogram,
            "purchaseunit":data.purchase_unit,
            "approver": data.approver,
            "id": this.props.productid
          }
          var headers = SessionManager.shared().getAuthorizationHeader();
          Axios.post(API.PutProduct , params, headers)
          .then(response => {
            if(response.data.Success===true){
                this.props.getproductetails();
                this.props.onHide();
            }
          });
        }
  
      selectCustomer = (val) =>{
        this.setState({val3: val.value});
        let tempArray = [];
        tempArray = this.state.customer;
        tempArray.map((data, index) => {
            if(data.key===val.value){
              if(data.note){
                this.setState({noteModalShow: true})
              }
                this.setState({customerNote:data.note})
            }
            return tempArray;
        })
      }
  
      setSupplier = () => {
        let supplierSelect = [];
        let supplierData = this.state.supplier;
        if(this.state.supplier){
            supplierData.map((supplier, index)=>{
                if(supplier.value===this.props.copyproduct.Supplier){
                    supplierSelect = { "label": supplier.value, "value": supplier.key }
                }
                return supplierData;
            });
        }
        return supplierSelect
      }
  
      // setSupplier = () => {
      //   let supplierSelect = [];
      //   let supplierData = this.props.supplier;
      //   if(this.props.supplier){
      //       supplierData.map((supplier, index)=>{
      //           if(supplier.value===this.props.copyproduct.Supplier){
      //               supplierSelect = { "label": supplier.value, "value": supplier.key }
      //           }
      //           return supplierData;
      //       });
      //   }
      //   return supplierSelect
      // }
  
      setCustomer = () => {
        let customerSelect = [];
        let customerData = this.state.customer;
        if(this.state.customer){
            var item = customerData.filter(item => Number(item.key)===Number(this.props.copyproduct.CustomerCode));
            if(item[0]){
              customerSelect = { "label": item[0].value, "value": item[0].key}
            }
           
        }
        return customerSelect;
      }

      setSalesUnit = () => {
        let salesSelect = [];
        let salesData = this.state.salesUnit;
        if(this.state.salesUnit){
          salesData.map((sales, index)=>{
                if(sales.value===this.props.copyproduct.Salesunit){
                  salesSelect = { "label": sales.value, "value": sales.key }
                }
                return salesData;
            });
        }
        return salesSelect
      }
  
      setProductGroup = () => {
        let productGroupSelect = [];
        let productGroupData = this.state.productGroup;
        if(this.state.productGroup){
          productGroupData.map((productGroup, index)=>{
                if(productGroup.value===this.props.copyproduct.Productgroup){
                  productGroupSelect = { "label": productGroup.value, "value": productGroup.key }
                }
                return productGroupData;
            });
        }
        return productGroupSelect
      }
  
      setPurchaseUnit = () => {
        let purchaseUnitSelect = [];
        let purchaseUnitData = this.state.purchaseUnit;
        if(this.state.purchaseUnit){
          purchaseUnitData.map((purchaseUnit, index)=>{
                if(purchaseUnit.value===this.props.copyproduct.PurchaseUnit){
                  purchaseUnitSelect = { "label": purchaseUnit.value, "value": purchaseUnit.key }
                }
                return purchaseUnitData;
            });
        }
        return purchaseUnitSelect
      }
      
      setApprover = () => {
        let approverSelect = [];
        let approverData = this.state.approver;
        if(this.state.approver){
          approverData.map((approver, index)=>{
                if(approver.value===this.props.copyproduct.Approver){
                  approverSelect = { "label": approver.value, "value": approver.key }
                }
                return approverData;
            });
        }
        return approverSelect
      }
  
      render(){
        let purchaseUnit=[];
        let approver = [];
        const supplier = this.state.supplier.map( s => ({value:s.key,label:s.value}) );
        const customer  = this.state.customer.map( s => ({value:s.key,label:s.value}) );
        const salesunit  = this.state.salesUnit.map( s => ({value:s.key,label:s.value}) );
        const productgroup = this.state.productGroup.map( s => ({value:s.key,label:s.value}) );
        if(this.state.purchaseUnit){
            purchaseUnit = this.state.purchaseUnit.map( s => ({value:s.key,label:s.value}) );
        }
        if(this.state.approver){
          approver = this.state.approver.map( s => ({value:s.key,label:s.value}) );
        }
          return (
              <Modal
                show={this.props.show}
                dialogAs={DraggableModalDialog}
                onHide={this.props.onHide}
                size="xl"
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
                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                            <Form.Label column sm="3">
                                {trls("Supplier")}
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Select
                                    name="Supplier"
                                    placeholder={trls('Select')}
                                    options={supplier}
                                    onChange={val => this.setState({val1:val})}
                                    defaultValue={this.setSupplier()}
                                />
                                {!this.props.disabled && this.props.copyflag!==0 && (
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
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                              {trls("Customer")}
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Select
                                    name="Customer"
                                    placeholder={trls('Select')}
                                    options={customer}
                                    onChange={val => this.selectCustomer(val)}
                                    defaultValue={this.setCustomer()}
                                />
                                {!this.props.disabled && this.props.copyflag!==0 && (
                                  <input
                                      onChange={val=>console.log()}
                                      tabIndex={-1}
                                      autoComplete="off"
                                      style={{ opacity: 0, height: 0 }}
                                      value={this.state.val3}
                                      required
                                      />
                                  )}
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                              {trls("Product")}
                            </Form.Label>
                            <Col sm="9">
                                <Form.Control type="text" name="product" defaultValue={this.props.copyproduct.product} placeholder="Product" />
                                {!this.props.disabled && (
                                  <input
                                      onChange={val=>console.log()}
                                      tabIndex={-1}
                                      autoComplete="off"
                                      style={{ opacity: 0, height: 0 }}
                                      />
                                  )}
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                              {trls("Description")}
                            </Form.Label>
                            <Col sm="9">
                                <Form.Control type="text" defaultValue={this.props.copyproduct.description} name="Description" placeholder="Description" />
                                {!this.props.disabled && (
                                  <input
                                      onChange={val=>console.log()}
                                      tabIndex={-1}
                                      autoComplete="off"
                                      style={{ opacity: 0, height: 0 }}
                                      />
                                  )}
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                              {trls("Salesunit")}
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Select
                                    name="Salesunit"
                                    placeholder={trls('Select')}
                                    options={salesunit}
                                    onChange={val =>this.setState({val4:val})}
                                    defaultValue={this.setSalesUnit()}
                                />
                                {!this.props.disabled && this.props.copyflag!==0 && (
                                  <input
                                      onChange={val=>console.log()}
                                      tabIndex={-1}
                                      autoComplete="off"
                                      style={{ opacity: 0, height: 0 }}
                                      value={this.state.val4}
                                      required
                                      />
                                  )}
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                              {trls("Product_Group")}
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Select
                                    name="Productgroup"
                                    placeholder={trls('Select')}
                                    options={productgroup}
                                    onChange={val => this.setState({val5:val})}
                                    defaultValue={this.setProductGroup()}
                                />
                                {!this.props.disabled && this.props.copyflag!==0 &&(
                                  <input
                                      onChange={val=>console.log()}
                                      tabIndex={-1}
                                      autoComplete="off"
                                      style={{ opacity: 0, height: 0 }}
                                      value={this.state.val5}
                                      required
                                      />
                                  )}
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                              {trls("Purchase_Unit")}
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Select
                                    name="purchase_unit"
                                    placeholder={trls('Select')}
                                    options={purchaseUnit}
                                    onChange={val => this.setState({val5:val})}
                                    defaultValue={this.setPurchaseUnit()}
                                />
                                {!this.props.disabled && this.props.copyflag!==0 && (
                                  <input
                                      onChange={val=>console.log()}
                                      tabIndex={-1}
                                      autoComplete="off"
                                      style={{ opacity: 0, height: 0 }}
                                      value={this.state.val5}
                                      required
                                      />
                                  )}
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                              {trls("Approver")}
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Select
                                    name="approver"
                                    placeholder={trls('Select')}
                                    options={approver}
                                    onChange={val => this.setState({val5:val})}
                                    defaultValue={this.setApprover()}
                                />
                                {!this.props.disabled && this.props.copyflag!==0 && (
                                  <input
                                      onChange={val=>console.log()}
                                      tabIndex={-1}
                                      autoComplete="off"
                                      style={{ opacity: 0, height: 0 }}
                                      value={this.state.val5}
                                      required
                                      />
                                  )}
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                              {trls("Kilogram")}
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Form.Control type="number" name="kilogram" placeholder="Kilogram" defaultValue={this.props.copyproduct.kilogram} onChange={val=>this.setState({val6:val})}/>
                                {!this.props.disabled && this.props.copyflag!==0&& (
                                  <input
                                      onChange={val=>console.log()}
                                      tabIndex={-1}
                                      autoComplete="off"
                                      style={{ opacity: 0, height: 0 }}
                                      value={this.state.val6}
                                      required
                                      />
                                  )}
                            </Col>
                        </Form.Group>
                        <Form.Group style={{textAlign:"center"}}>
                            <Button type="submit" style={{width:"100px"}}>Save</Button>
                        </Form.Group>
                        <Form.Control type="text" hidden name="token" defaultValue={this.props.token} />
                        <Customernote
                            show={this.state.noteModalShow}
                            onHide={() => this.setState({noteModalShow: false})}
                            customerNote={this.state.customerNote}
                            // customerData
                        />
                    </Form>
                </Modal.Body>
              </Modal>
            );
      }
    }
    export default Updateproductform;
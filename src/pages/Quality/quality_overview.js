import React, {Component} from 'react'
import { connect } from 'react-redux';
import $ from 'jquery';
import { BallBeat } from 'react-pure-loaders';
import { Button, Form, Row, Spinner, Col } from 'react-bootstrap';
import { trls } from '../../components/translate';
import { trlsPDF } from '../../components/translate';
import 'datatables.net';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import Select from 'react-select';
import * as Common from '../../components/common';
import FlashMassage from 'react-flash-message'
import Setlanguageform from "./setlanguage_form";
import Filtercomponent from '../../components/filtercomponent';
import Salesorderdetail from '../Sales/selesorder_detail';
import Contextmenu from '../../components/contextmenu';
import jsPDF from "jspdf";
import 'jspdf-autotable'
import {Logoimage} from './logo_image'

const mapStateToProps = state => ({
     ...state.auth,
});

const mapDispatchToProps = dispatch => ({

}); 

class Taskoverview extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            loading:true,
            qualityData:[],
            showModeList: [{"value": 1, "label": trls('Show_all')}, {"value": 2, "label": trls('Show_just_not_completed')}, {"value": 3, "label": trls('Show_just_completed')}],
            showMode: 2,
            exactFlag: false,
            sendingFlag: false,
            fistFilterWeek: 0,
            secondFilterWeek: 0,
            firstFilterDate: new Date(),
            secondFilterDate: new Date(),
            filterDateFlag: false,
            filterWeekFlag: false,
            orderId: '',
            customerCode: '',
            supplierCode: '',
            detailFlag: '',
            filterData: [],
            originpurchaseorders: [],
            filterFlag: false,
            filteredData: [],
            slideDetailFlag: false,
            customerData: [],
            supplierData: [],
            filterColunm: [
                {"label": 'Id', "value": "Id", "type": 'text', "show": true},
                {"label": 'Customer', "value": "customer", "type": 'text', "show": true},
                {"label": 'Supplier', "value": "supplier", "type": 'text', "show": true},
                {"label": 'Reference_customer', "value": "referencecustomer", "type": 'text', "show": true},
                {"label": 'Purchase_Amount', "value": "PurchaseAmount", "type": 'date', "show": true},
                {"label": 'Sales_Amount', "value": "SalesAmount", "type": 'date', "show": true},
                {"label": 'Loading_date', "value": "Loadingdate", "type": 'text', "show": true},
                {"label": 'Loading_week', "value": "Loadingweek", "type": 'text', "show": true},
                {"label": 'PackingSlip', "value": "PackingSlip", "type": 'text', "show": true},
                {"label": 'Container', "value": "Container", "type": 'text', "show": true},
                {"label": 'Shipping', "value": "Container", "type": 'text', "show": true},
                {"label": 'BookingNumber', "value": "BookingNumber", "type": 'text', "show": true},
                {"label": 'Action', "value": "Action", "type": 'text', "show": true},
                // {"label": 'CreateProFormaInvoice', "value": "CreateProFormaInvoice", "type": 'text', "show": true},
            ],
            LanguagemodalShow: false,
            pdfLang: '',
            invoicePdfId: ''
        };
        this.divToPrint = React.createRef();
      }
componentDidMount() {
    this._isMounted = true;
    this.getQualityData();
    this.setFilterData();
    this.getCustomerData();
    this.getSupplierData();
}

detailmode = () =>{
    this.setState({taskId: ""})
}

getQualityData = (data) => {
    this.setState({loading:true})
    var header = SessionManager.shared().getAuthorizationHeader();
    Axios.get(API.GetQualityControl, header)
    .then(result => {
        let optionarray = [];
        if(!data || data.length===0){
            if(result.data.Items){
                result.data.Items.map((value, index) => {
                    if(this.state.showMode===1){
                        optionarray.push(value);
                    }else if(this.state.showMode===2){
                        if(!value.isCompleted){
                            optionarray.push(value);
                        }
                    }else{
                        if(value.isCompleted){
                            optionarray.push(value);
                        }
                    }
                    return value;
                })
            }
            this.setState({qualityData: optionarray, showModeData: optionarray, loading: false, originFilterData: result.data.Items})
        }else{
            data.map((value, index) => {
                if(this.state.showMode===1){
                    optionarray.push(value);
                }else if(this.state.showMode===2){
                    if(!value.isCompleted){
                        optionarray.push(value);
                    }
                }else{
                    if(value.isCompleted){
                        optionarray.push(value);
                    }
                }
                return value;
            })
            this.setState({qualityData: optionarray, showModeData: optionarray, loading: false, originFilterData: result.data.Items})
        }
        $('.fitler').on( 'keyup', function () {
            table.search( this.value ).draw();
        } );
        $('#example-task').dataTable().fnDestroy();
        var table = $('#example-task').DataTable(
        {
            "language": {
                "lengthMenu": trls("Show")+" _MENU_ "+trls("Result_on_page"),
                "zeroRecords": "Nothing found - sorry",
                "info": trls("Show_page")+" _PAGE_ "+trls('Results_of')+" _PAGES_",
                "infoEmpty": "No records available",
                "infoFiltered": "(filtered from _MAX_ total records)",
                "search": trls('Search'),
                "paginate": {
                    "previous": trls('Previous'),
                    "next": trls('Next')
                }
            },
                "dom": 't<"bottom-datatable" lip>',
                "order": [[ 0, "desc" ]]
            }
        );
    });
}

// filter module
setFilterData = () => {
    let filterData = [
        {"label": trls('Supplier'), "value": "supplier", "type": 'text'},
        {"label": trls('Customer'), "value": "customer", "type": 'text'},
        {"label": trls('Reference_customer'), "value": "referencecustomer", "type": 'text'},
        {"label": trls('Purchase_Amount'), "value": "PurchaseAmount", "type": 'date'},
	    {"label": trls('Sales_Amount'), "value": "SalesAmount", "type": 'date'},
        {"label": trls('Loading_date'), "value": "Loadingdate", "type": 'text'},
	    {"label": trls('Loading_week'), "value": "Loadingweek", "type": 'text'}
    ]
    this.setState({filterData: filterData});
}

filterOptionData = (filterOption) =>{
    let dataA = []
    dataA = Common.filterData(filterOption, this.state.originFilterData);
    if(!filterOption.length){
        dataA=null;
    }
    this.setState({filteredData: dataA})
    $('#example-task').dataTable().fnDestroy();
    this.getQualityData(dataA);
}

changeFilter = () => {
    if(this.state.filterFlag){
        this.setState({filterFlag: false})
    }else{
        this.setState({filterFlag: true})
    }
}
// filter module

componentWillUnmount() {
    this._isMounted = false;
}

getCustomerData = () => {
    var header = SessionManager.shared().getAuthorizationHeader();
    Axios.get(API.GetCustomerData, header)
    .then(result => {
        if(this._isMounted){
            this.setState({customerData: result.data.Items})
        }
    });
}

getSupplierData = () => {
    var header = SessionManager.shared().getAuthorizationHeader();
    Axios.get(API.GetSuppliersDropdown, header)
    .then(result => {
        if(this._isMounted){
            this.setState({supplierData: result.data.Items})
        }
    });
}

loadSalesDetail = (data)=>{
    // Common.showSlideForm();
    let detailData = [];
    let customerData = this.state.customerData.filter(item => item.key===data.customercode.trim());
    let supplierData = this.state.supplierData.filter(item => item.key===data.suppliercode.trim());
    detailData = data;
    detailData.Customer = customerData[0].value;
    detailData.Supplier = supplierData[0].value;
    detailData.CustomerCode = customerData[0].key;
    detailData.SupplierCode = supplierData[0].key;
    detailData.arrivaldate = "1900-01-01T00:00:00";
    detailData.loadingdate = data.Loadingdate;
    this.setState({newId: data.Id, salesDetailData: data, customercode:data.customercode, suppliercode: data.suppliercode, slideDetailFlag: true})
}

completeOrder = (id) => {
    this.setState({sendingFlag: true, exactFlag: false})
    let filterData = this.state.filteredData;
    let params = []
    var headers = SessionManager.shared().getAuthorizationHeader();
    params = {
        salesid: id
    }
    Axios.post(API.PostSalesOrderExact, params, headers)
    .then(result => {
        params = {id: id}
        Axios.post(API.CompleteOrder , params, headers)
        .then(result => {
            this.setState({exactFlag: true, sendingFlag: false}, ()=>{
                filterData.map((data, key)=>{
                    if(data.Id===id){
                        data.isCompleted = true;
                    }
                    return data
                })
                this.getQualityData(filterData);
            });
        });
    });
    
}

changeShowMode = (value) =>{
    this.setState({showMode: value}, ()=>{
        if(this.state.filteredData.length){
            this.getQualityData(this.state.filteredData);
        }else{
            this.getQualityData();
        }
        
    });
}

removeColumn = (value) => {
    let filterColunm = this.state.filterColunm;
    filterColunm = filterColunm.filter(function(item, key) {
        if(trls(item.label)===value){
        item.show = false;
        }
        return item;
    })
    this.setState({filterColunm: filterColunm})
}

showColumn = (value) => {
    let filterColum = this.state.filterColunm;
    filterColum = filterColum.filter((item, key)=>item.label===value);
    return filterColum[0].show;
}

createIvoicePdf = (addressData, lineData) => {
    let bedragSum = 0;
    let tableBodyData = [];
    lineData.map((data, index)=>{
        let bodyList = [];
        if(data.Text===''){
            bodyList[0] = Common.formatDate(data.Loadingdate);
            bodyList[1] = data.Quantity+" "+data.Unit;
            bodyList[2] = data.description;
            bodyList[3] = Common.formatMoney(data.Value);
            bodyList[4] = Common.formatMoney(data.Amount);
            tableBodyData.push(bodyList);
        }else{
            bodyList[0] = '';
            bodyList[1] = data.Text;
            bodyList[2] = '';
            bodyList[3] = '';
            bodyList[4] = '';
            tableBodyData.push(bodyList);
        }
        
        bedragSum += data.Amount;
        return data;
    })
    let totalBTW = bedragSum/100*addressData.btwper;
    let nowDate = new Date()
    let next30daysDate = new Date(nowDate.setDate(nowDate.getDate() + 30))
    const doc = new jsPDF("p", "mm", "a4");
    doc.addImage(Logoimage, 'PNG', 2, 2, 60, 10);
    doc.setTextColor(0, 0, 252);
    doc.setFontSize(10);
    doc.text(113, 10, 'Sluiskade NZ 79 - 7676 SH Westerhaar - The Netherlands');
    doc.text(165, 15, 'Tel: +31-(0)-524 525 123');
    doc.text(164, 20, 'Fax: +31-(0)-524 524 196');
    doc.text(170, 25, 'Mail: info@nevema.nl');
    doc.setTextColor(0, 0, 0);
    // doc.text(1, 50, 'BTW-Nr. NL 001898486B01');
    doc.text(113, 60, addressData.DebtorName);
    doc.text(113, 65, addressData.AddressLine1);
    doc.text(113, 70, addressData.PostalCode+" "+addressData.City);
    // doc.text(15, 90, 'Leveringsvoorwaarde:');
    // doc.text(15, 95, 'Af Kade');
    doc.text(70, 90, trlsPDF('Reference')+':  '+addressData.ReferenceCustomer);
    //center table
    doc.autoTable({
        columnStyles: {0: {fillColor: [255, 255, 255], cellPadding: 1, cellWidth: 25}, 1: {fillColor: [255, 255, 255], cellPadding: 1, cellWidth: 35}, 2: {fillColor: [255, 255, 255], cellPadding: 1}, 3: {fillColor: [255, 255, 255], cellPadding: 1}, 4: {fillColor: [255, 255, 255], cellPadding: 1, cellWidth: 25}},
        head: [[trlsPDF("DelDate"), trlsPDF('NumberUnit'), trlsPDF('Description'), trlsPDF('Price'), trlsPDF('Amount')]],
        body: tableBodyData,
        margin: { top: 100 },
    })
    doc.setDrawColor(0, 0, 0);
    doc.line(5, 225, 5, 240)
    doc.line(5, 225, 75, 225)
    doc.text(6, 230, trlsPDF('PaymentCondition')+' : Binnen 30 dagen netto');
    doc.text(6, 235, trlsPDF('ExpireDate')+': '+ Common.formatDate(next30daysDate));
    doc.line(5, 240, 75, 240)
    doc.line(75, 225, 75, 240)

    doc.text(150, 200, trlsPDF('TotalExcl')+'   EUR:   '+ Common.formatQuantity(bedragSum));
    doc.text(150, 205, trlsPDF('TotalVat')+'     '+addressData.btwper+' %:    '+Common.formatQuantity(totalBTW));
    //polygon
    doc.line(80, 240, 200, 240);//down
    doc.line(80, 240, 80, 220);//left
    doc.line(80, 220, 200, 220);//up
    doc.line(200, 220, 200, 240);//right
    //inline
    doc.line(80, 229, 200, 229);//1
    doc.line(110, 240, 110, 220);//2
    doc.line(140, 225, 140, 240);//3
    doc.line(170, 240, 170, 220);//4
    doc.line(110, 225, 170, 225);//4
    //in text
    doc.text(84, 225, trlsPDF('InvoiceDate'));
    doc.text(120, 224, trlsPDF('PaymentReference'));
    doc.text(113, 228, trlsPDF('InvoiceNumber'));
    doc.text(143, 228, trlsPDF('CustomerNumber'));
    doc.text(174, 225, trlsPDF('InvoiceAmount'));

    doc.text(86, 235, Common.formatDate(new Date()));
    doc.text(115, 235, Common.formatDateThree(new Date()));
    doc.text(146, 235, '810515');
    doc.setFontType("bold");
    doc.setFontSize(12);
    doc.text(172, 235, '€');
    doc.text(180, 235, Common.formatQuantity(bedragSum+totalBTW));
    doc.setFontSize(10);
    let str1 = "VAT-ID Nr. NL001898486B01 Chamber of Commerce - Groningen Nr. 05023998";
    let str2 = "Bank details:     ABN Amro 62.60.29.562 * IBAN: NL58ABNA0626029562* Swiftcode: ABNANL2A";
    let str3 = "All agreements are subject to the general sales conditions of the VPN";
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    doc.setFontSize(10);
    doc.text(str1, pageWidth / 2, 245, 'center');
    doc.text(str2, pageWidth / 2-10, 250, 'center');
    doc.text(str3, pageWidth / 2, 255, 'center');
    let text = trlsPDF('InvoiceNevemaPdf');
    var splitText = doc.splitTextToSize(text, 250);
    doc.setFontSize(7);
    doc.setFontType("normal");
    var y = 261;
    for (var i=0; i<splitText.length; i++){
        if (y > 275){
            y = 20;
            doc.addPage();
        }
        doc.text(28, y, splitText[i]);
        y = y + 4;
    }
    doc.save('Invoice')
}

createPdfDocument = () => {
    const { invoicePdfId } = this.state;
    this.setState({LanguagemodalShow: false})
    let addressData = [];
    let lineData = [];
    let params = {
        id: invoicePdfId
    }
    var headers = SessionManager.shared().getAuthorizationHeader();
    Axios.post(API.GetAddress, params, headers)
    .then(result => {
        if(result.data.Success){
            addressData = result.data.Items[0];
            Axios.post(API.GetLines, params, headers)
            .then(result => {
                if(result.data.Items.length>0){
                    lineData = result.data.Items;
                    this.createIvoicePdf(addressData, lineData)
                }
            })
        }
    });
}

showSetLanguage = (invoiceData) =>{
    this.setState({LanguagemodalShow: true, pdfLang: invoiceData.language === "NL" ? "Dutch" : "English", invoicePdfId: invoiceData.Id})
    localStorage.setItem('nevema_lang_PDF', invoiceData.language === "NL" ? "nl_BE" : "en_US");
}

render () {
    const { filterColunm, LanguagemodalShow } = this.state;
    let qualityData = this.state.qualityData
    qualityData.sort(function(a, b) {
        return a.id - b.id;
    });
    return (
        <div className="order_div">
            
            <div className="content__header content__header--with-line">
                <h2 className="title">{trls('Quality')}</h2>
            </div>
            
             {this.state.exactFlag&&(
                <div style={{marginLeft: 20}}>
                    <FlashMassage duration={2000}>
                        <div className="alert alert-success" style={{marginTop:10}}>
                            <strong><i className="fas fa-check-circle"></i> Success!</strong>
                        </div>
                    </FlashMassage>
                </div>
            )
            }
            {this.state.sendingFlag&&(
                <div style={{marginTop:10, marginLeft: 20}}><Spinner animation="border" variant="info"/><span style={{marginTp:10, fontWeight: "bold", fontSize: 16}}> {trls('Sending')}...</span></div>
            )}
            <div className="orders">
                <Row>
                    <Col sm={6}>
                        <Select
                            name="filter"
                            options={this.state.showModeList}
                            className="select-show-class"
                            onChange={val => this.changeShowMode(val.value)}
                            defaultValue={{"value": "2", "label":trls('Show_just_not_completed')}}
                        />
                    </Col>
                    <Col sm={6} className="has-search">
                        <div style={{display: 'flex', float: 'right'}}>
                            <Button variant="light" onClick={()=>this.changeFilter()}><i className="fas fa-filter add-icon"></i>{trls('Filter')}</Button>
                            <div style={{marginLeft: 20}}>
                                <span className="fa fa-search form-control-feedback"></span>
                                <Form.Control className="form-control fitler" type="text" name="number"placeholder={trls("Quick_search")}/>
                            </div>
                        </div>
                    </Col>
                    {this.state.filterData.length&&(
                        <Filtercomponent
                            onHide={()=>this.setState({filterFlag: false})}
                            filterData={this.state.filterData}
                            onFilterData={(filterOption)=>this.filterOptionData(filterOption)}
                            showFlag={this.state.filterFlag}
                        />
                    )}
                </Row>
                <div className="table-responsive purchase-order-table">
                    <table id="example-task" className="place-and-orders__table table" width="100%">
                        <thead>
                            <tr>
                                {filterColunm.map((item, key)=>(
                                    <th className={!item.show ? "filter-show__hide" : ''} key={key}>
                                        <Contextmenu
                                            triggerTitle = {trls(item.label) ? trls(item.label) : ''}
                                            addFilterColumn = {(value)=>this.addFilterColumn(value)}
                                            removeColumn = {(value)=>this.removeColumn(value)}
                                        />
                                    </th>
                                    )
                                )}
                          </tr>
                        </thead>
                        {qualityData && !this.state.loading &&(<tbody >
                            {
                                qualityData.map((data,i) =>(
                                <tr id={data.id} key={i}>
                                    <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}><div id={data.id} style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadSalesDetail(data)}>{data.Id}</div></td>
                                    <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>{data.customer}</td>
                                    <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.supplier}</td>
                                    <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>{data.referencecustomer}</td>
                                    <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.PurchaseAmount)}</td>
                                    <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>{Common.formatMoney(data.SalesAmount)}</td>
                                    <td className={!this.showColumn(filterColunm[6].label) ? "filter-show__hide" : ''}>{Common.formatDate(data.Loadingdate)}</td>
                                    <td className={!this.showColumn(filterColunm[7].label) ? "filter-show__hide" : ''}>{data.Loadingweek}</td>
                                    <td className={!this.showColumn(filterColunm[8].label) ? "filter-show__hide" : ''}>{data.PackingSlip}</td>
                                    <td className={!this.showColumn(filterColunm[9].label) ? "filter-show__hide" : ''}>{data.Container}</td>
                                    <td className={!this.showColumn(filterColunm[10].label) ? "filter-show__hide" : ''}>{data.Shipping}</td>
                                    <td className={!this.showColumn(filterColunm[11].label) ? "filter-show__hide" : ''}>{data.BookingNumber}</td>
                                    <td className={!this.showColumn(filterColunm[12].label) ? "filter-show__hide" : ''}>
                                        <Row style={{justifyContent:"space-around", width: 250}}>
                                            {!data.isCompleted && data.referencecustomer!=="Nog te plannen" && data.customer!=="" && !data.Temporary?(
                                                <Button type="submit" style={{width:"auto", height: 35}} onClick={()=>this.completeOrder(data.Id)}>{trls('SalesInvoice')}</Button>
                                            ):
                                                <Button type="submit" disabled style={{width:"auto", height: 35}}>{trls('SalesInvoice')}</Button>
                                            }
                                            <Button style={{width:"auto", height: 35}} onClick={()=>this.showSetLanguage(data)}>{trls('ProFormaInvoice')}</Button>
                                        </Row>
                                    </td>
                                </tr>
                            ))
                            }
                        </tbody>)}
                    </table>
                    { this.state.loading&& (
                        <div className="col-md-4 offset-md-4 col-xs-12 loading" style={{textAlign:"center"}}>
                            <BallBeat
                                color={'#222A42'}
                                loading={this.state.loading}
                            />
                        </div>
                    )}
                    {this.state.slideDetailFlag ? (
                        <Salesorderdetail
                            newid={this.state.newId}
                            onHide={() => this.setState({slideDetailFlag: false})}
                            customercode={this.state.customercode}
                            suppliercode={this.state.suppliercode}
                            salesdetaildata={this.state.salesDetailData}
                            viewDetailFlag={true}
                        />
                    ): null}
                    {LanguagemodalShow && (
                        <Setlanguageform
                            show={LanguagemodalShow}
                            onHide={()=>this.createPdfDocument()}
                            pdfLanguage={this.state.pdfLang}
                        />
                    )}
                </div>
            </div>
        </div>
    )
};
}
export default connect(mapStateToProps, mapDispatchToProps)(Taskoverview);

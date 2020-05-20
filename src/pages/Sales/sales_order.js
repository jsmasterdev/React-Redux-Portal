import React, {Component} from 'react'
import { connect } from 'react-redux';
import $ from 'jquery';
import { BallBeat } from 'react-pure-loaders';
import { Button, Form, Col, Row } from 'react-bootstrap';
import  Salesform  from './salesform'
import { trls } from '../../components/translate';
import 'datatables.net';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import * as Common  from '../../components/common';
import Salesorderdetail from './selesorder_detail';
import Filtercomponent from '../../components/filtercomponent';
import Contextmenu from '../../components/contextmenu';
import SweetAlert from 'sweetalert';

const mapStateToProps = state => ({
     ...state.auth,
});

const mapDispatchToProps = dispatch => ({

}); 
class Salesorder extends Component {
    _isMounted = false
    
    constructor(props) {
        let pathname = window.location.pathname;
        let pathArray = pathname.split('/');
        super(props);
        this.state = {  
            loading:true,
            salesData:[],
            slideFormFlag: false,
            slideDetailFlag: false,
            salesDetailData: [],
            originFilterData: [],
            filterFlag: false,
            filterData: [],
            filterColunm: [
                {"label": 'Id', "value": "id", "type": 'text', "show": true},
                {"label": 'Customer', "value": "Customer", "type": 'text', "show": true},
                {"label": 'Supplier', "value": "Supplier", "type": 'text', "show": true},
                {"label": 'Reference_customer', "value": "referencecustomer", "type": 'text', "show": true},
                {"label": 'Loading_date', "value": "loadingdate", "type": 'date', "show": true},
                {"label": 'Salesunit', "value": "SalesUnit", "type": 'text', "show": true},
                {"label": 'Sales_Quantity', "value": "SalesQuantity", "type": 'text', "show": true},
                {"label": 'Purchase_Unit', "value": "PurchaseUnit", "type": 'text', "show": true},
                {"label": 'Purchase_Quantity', "value": "PurchaseQuantity", "type": 'text', "show": true},
                {"label": 'Productcode', "value": "ProductCode", "type": 'text', "show": true},
                {"label": 'PackingSlip', "value": "PackingSlip", "type": 'text', "show": true},
                {"label": 'Container', "value": "Container", "type": 'text', "show": true},
                {"label": 'Shipping', "value": "Container", "type": 'text', "show": true},
                {"label": 'ExactBooking', "value": "Container", "type": 'text', "show": true},
                {"label": 'Action', "value": "Action", "type": 'text', "show": true},
            ],
            loadingFlag: false,
            newId: pathArray[2] ? pathArray[2] : '',
        };
      }
componentDidMount() {
    this.getsalesData();
    this.setFilterData();
}

getsalesData = (data) => {
    this.setState({loading: true})
    var header = SessionManager.shared().getAuthorizationHeader();
    Axios.get(API.GetSalesData, header)
    .then(result => {
        if(!data){
            this.setState({salesData: result.data.Items, originFilterData: result.data.Items});
        }else{
            this.setState({salesData: data});
        }
        this.setState({loading: false})
        $('.fitler').on( 'keyup', function () {
            table.search( this.value ).draw();
        } );
        $('#sales_table').dataTable().fnDestroy();
        var table = $('#sales_table').DataTable(
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
        {"label": trls('Id'), "value": "id", "type": 'text', "show": true},
        {"label": trls('Customer'), "value": "Customer", "type": 'text'},
        {"label": trls('Supplier'), "value": "Supplier", "type": 'text'},
        {"label": trls('Reference_customer'), "value": "referencecustomer", "type": 'text'},
        {"label": trls('Loading_date'), "value": "loadingdate", "type": 'date'},
        {"label": trls('Arrival_date'), "value": "arrivaldate", "type": 'date'},
        {"label": trls('Productcode'), "value": "ProductCode", "type": 'text'},
        {"label": trls('Quantity'), "value": "Quantity", "type": 'text'},
        {"label": trls('PackingSlip'), "value": "PackingSlip", "type": 'text'},
        {"label": trls('Container'), "value": "Container", "type": 'text'}
    ]
    this.setState({filterData: filterData});
}

filterOptionData = (filterOption) =>{
    let dataA = []
    dataA = Common.filterData(filterOption, this.state.originFilterData);
    if(!filterOption.length){
        dataA=null;
    }
    $('#sales_table').dataTable().fnDestroy();
    this.getsalesData(dataA);
}

changeFilter = () => {
    if(this.state.filterFlag){
        this.setState({filterFlag: false})
    }else{
        this.setState({filterFlag: true})
    }
}
// filter module
loadSalesDetail = (data)=>{
    this.setState({newId: data.id, slideDetailFlag: true})
}

addSales = () => {
    this.setState({copyProduct: '', copyFlag: 1, slideFormFlag: true});
    Common.showSlideForm();
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

deleteSalesOrder = (id) => {
    let params = {
        id: id
    }
    var header = SessionManager.shared().getAuthorizationHeader();
    Axios.post(API.DeleteSalesOrder, params, header)
    .then(result=>{
        if(result.data.Success){
            SweetAlert({
                title: trls('Success'),
                icon: "success",
                button: "OK",
            });
            this.getsalesData();
        }
    })
}

deleteDocment = (id) => {
    let params = {
        id: id
    }
    var header = SessionManager.shared().getAuthorizationHeader();
    Axios.post(API.DeleteSalesDocument, params, header)
    .then(result=>{
        if(result.data.Success){
            this.getsalesData();
        }
    })
}

render () {

    let salesData = this.state.salesData;
    const { filterColunm } = this.state;
    salesData.sort(function(a, b) {
        return a.id - b.id;
    });
    return (
        <div className="order_div">
            <div className="content__header content__header--with-line">
                <h2 className="title">{trls('Sales_Order')}</h2>
            </div>
            <div className="orders">
                <Row>
                    <Col sm={6}>
                        <Button variant="primary" onClick={()=>this.addSales()}><i className="fas fa-plus add-icon"></i>{trls('Sales_Order')}</Button>   
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
                    <table id="sales_table" className="place-and-orders__table table" width="100%">
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
                        {salesData && !this.state.loading &&(<tbody >
                            {
                                salesData.map((data,i) =>(
                                <tr id={data.id} key={i}>
                                    <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}>
                                        <div id={data.id} style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadSalesDetail(data)}>{data.id}</div>
                                    </td>
                                    <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>
                                        <div>{data.Customer}</div>
                                    </td>
                                    <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.Supplier}</td>
                                    <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>{data.referencecustomer}</td>
                                    <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>{Common.formatDate(data.loadingdate)}</td>
                                    <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>{data.SalesUnit}</td>
                                    <td className={!this.showColumn(filterColunm[6].label) ? "filter-show__hide" : ''}>{data.SalesQuantity}</td>
                                    <td className={!this.showColumn(filterColunm[7].label) ? "filter-show__hide" : ''}>{data.PurchaseUnit}</td>
                                    <td className={!this.showColumn(filterColunm[8].label) ? "filter-show__hide" : ''}>{data.PurchaseQuantity}</td>
                                    <td className={!this.showColumn(filterColunm[9].label) ? "filter-show__hide" : ''}>{data.ProductCode}</td>
                                    <td className={!this.showColumn(filterColunm[10].label) ? "filter-show__hide" : ''}>{data.PackingSlip}</td>
                                    <td className={!this.showColumn(filterColunm[11].label) ? "filter-show__hide" : ''}>{data.Container}</td>
                                    <td className={!this.showColumn(filterColunm[12].label) ? "filter-show__hide" : ''}>{data.Shipping}</td>
                                    <td className={!this.showColumn(filterColunm[13].label) ? "filter-show__hide" : ''} style={{width: 100}}>
                                        {data.exactBooking ? (
                                            <Row>
                                                <i className="fas fa-check-circle order-booking__icon-active"></i>
                                                <span className="exact-booking__number">{data.exactBooking}</span>
                                            </Row>
                                        ):
                                            <Row>
                                                <i className="fas fa-times-circle order-booking__icon-inactive"></i>
                                                <span className="exact-booking__number"></span>
                                            </Row>
                                        }
                                    </td>
                                    <td className={!this.showColumn(filterColunm[13].label) ? "filter-show__hide" : ''}>
                                        <Row style={{justifyContent:"space-around", width: 100}}>
                                            {!data.exactBooking && (
                                                <Button variant="light" onClick={()=>this.deleteSalesOrder(data.id)} className="action-button"><i className="fas fa-trash-alt add-icon"></i>{trls('Delete')}</Button>
                                            )}
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
                </div>
            </div>
            {this.state.slideFormFlag ? (
                <Salesform
                    show={this.state.modalShow}
                    onHide={() => this.setState({slideFormFlag: false})}
                    onloadSalesDetail={(data) => this.loadSalesDetail(data)}
                    onLoadingFlag={(value) => this.setState({loadingFlag: value})}
                />
            ): null}
            {this.state.newId ? (
                <Salesorderdetail
                    newid={this.state.newId}
                    onHide={() => this.setState({slideDetailFlag: false, newId: ''})}
                    customercode={this.state.customercode}
                    suppliercode={this.state.suppliercode}
                    onGetSalesData={()=>this.getsalesData()}
                    viewDetailFlag={false}
                />
            ): null}
        </div>
    )
};
}
export default connect(mapStateToProps, mapDispatchToProps)(Salesorder);

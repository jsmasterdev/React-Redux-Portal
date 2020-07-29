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
import * as Auth from '../../components/auth';

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
            loading:false,
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
            userInfo: Auth.getUserInfo(),
            obj: this,
            orderData: [],
        };
      }

    componentDidMount() {
        
        this.getsalesData();
        this.setFilterData();
    }

    getsalesData = () => {
        this.setState({loading: true});
        $('#sales_table tbody').css('display', 'none');
        $('#sales_table').dataTable().fnDestroy();
        var header = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetSalesData, header)
        .then(result => {
            console.log('result', result)
            this.setState({orderData: result.data.Items, originFilterData: result.data.Items, loading: false}, ()=>{
                this.setDataTable(null);
            });
        });
    }

    setDataTable = () => {
        const { filterColunm, userInfo, orderData } = this.state;
        let obj = this.state.obj;
        let dataTableData = [];
        let tempOrder = [];
        orderData.sort(function(a, b) {
            return a.id - b.id;
        });
        orderData.map((order, index)=>{
            tempOrder = [order.id, order.Customer, order.Supplier, order.referencecustomer, Common.formatDate(order.loadingdate), order.SalesUnit, order.SalesQuantity, order.PurchaseUnit, order.PurchaseQuantity, order.ProductCode, order.PackingSlip, order.Container, order.Shipping, order.exactBooking, ''];
            dataTableData.push(tempOrder);
            return order;
        })
        $('.fitler').on( 'keyup', function () {
            table.search( this.value ).draw();
        } );
        $('#sales_table').dataTable().fnDestroy();
        var table = $('#sales_table').DataTable(
            {
                data: dataTableData,
                deferRender:    true,
                createdRow: function(row, data, dataIndex){
                    filterColunm.map((colunm, index)=>{
                        if(colunm.show){
                            $('td:eq('+index+')', row).css('display', 'contens');
                        } else {
                            $('td:eq('+index+')', row).css('display', 'none');
                        }
                        return colunm;
                    })
                    $('td:eq(1)', row).css('width', '300px');
                    $('td:eq(0)', row).html("<div class='order-table__id' id="+data[0]+">"+data[0]+"</div>")
                    $('td:eq(13)', row).html(data[13] ? "<div class='row' style='width: 85px'><i class='fas fa-check-circle order-booking__icon-active'></i><span class='exact-booking__number'>"+data[13]+"</span></div>" : "<div class='row'><i class='fas fa-times-circle order-booking__icon-inactive'></i><span class='exact-booking__number'></span></div>");
                    if(userInfo.roles==="Administrator"){
                        $('td:eq(14)', row).html("<div class='row' style='justify-Content:space-around; width: 100'><button id="+data[0]+" type='button' class='action-button btn btn-light delete-order'><i class='fas fa-trash-alt add-icon' aria-hidden='true'></i>Verwijderen</button></div>")
                    }
                },
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
        $('#sales_table tbody').css('display', 'contents');
        $('#sales_table').on('click', '.delete-order', function(){
            obj.deleteSalesOrder(this.id);
        }); 
        $('#sales_table').on('click', '.order-table__id', function(){
            obj.loadSalesDetail(this.id);
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
        let originFilterData = this.state.originFilterData;
        dataA = Common.filterData(filterOption, originFilterData);
        if(!filterOption.length){
            this.setState({orderData: originFilterData}, ()=>{
                this.setDataTable(null);
            });
        } else {
            this.setState({orderData: dataA}, ()=>{
                this.setDataTable(null);
            });
        }
    }

    changeFilter = () => {
        if(this.state.filterFlag){
            this.setState({filterFlag: false})
        }else{
            this.setState({filterFlag: true})
        }
    }
    // filter module
    loadSalesDetail = (orderId)=>{
        console.log(123, orderId);
        this.setState({newId: orderId, slideDetailFlag: true})
    }

    addSales = () => {
        this.setState({copyProduct: '', copyFlag: 1, slideFormFlag: true});
        Common.showSlideForm();
    }

    removeColumn = (value, colunmIndex) => {
        let filterColunm = this.state.filterColunm;
        filterColunm = filterColunm.filter(function(item, key) {
        if(trls(item.label)===value){
            item.show = false;
        }
        return item;
        })
        this.setState({filterColunm: filterColunm, colunmKey: colunmIndex}, () => {
            this.setDataTable(null);
        })
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
                })
                .then((value) => {
                    this.getsalesData();
                    return;
                }); ;
            
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
        const { filterColunm } = this.state;
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
                                    {filterColunm.map((item, index)=>(
                                        <th className={!item.show ? "filter-show__hide" : ''} key={index}>
                                            <Contextmenu
                                                triggerTitle = {trls(item.label) ? trls(item.label) : ''}
                                                addFilterColumn = {(value)=>this.addFilterColumn(value)}
                                                removeColumn = {(value, key)=>this.removeColumn(value, index)}
                                            />
                                        </th>
                                        )
                                    )}
                                </tr>
                            </thead>
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
                        onloadSalesDetail={(data) => this.loadSalesDetail(data.id)}
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

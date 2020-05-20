import React, {Component} from 'react'
import { connect } from 'react-redux';
import $ from 'jquery';
import { BallBeat } from 'react-pure-loaders';
import { Button, Form, Row, Col } from 'react-bootstrap';
import  Taskupdate  from './taskupdate_form'
import { trls } from '../../components/translate';
import 'datatables.net';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import Filtercomponent from '../../components/filtercomponent';
import * as Common  from '../../components/common';
import Contextmenu from '../../components/contextmenu';

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
            taskOverviewData:[],
            text: 1111,
            originFilterData: [],
            filterFlag: false,
            filterData: [],
            filterColunm: [
                {"label": 'Id', "value": "Id", "type": 'text', "show": true},
                {"label": 'Tasktype', "value": "Tasktype", "type": 'text', "show": true},
                {"label": 'Subject', "value": "subject", "type": 'text', "show": true},
                {"label": 'TaskStatus', "value": "TaskStatus", "type": 'text', "show": true},
                {"label": 'User', "value": "User", "type": 'date', "show": true},
                {"label": 'Action', "value": "Action", "type": 'text', "show": true},
            ],
        };
    }
    
    componentDidMount() {
        this.getTaskData();
        this.setFilterData();
    }

    getUpdateTaskData = (event) => {
            
        this._isMounted = true;
        let taskid=event.currentTarget.id;
        let params = {
            taskid:taskid
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetTaskById, params, headers)
        .then(result => {
            if(this._isMounted){    
                this.setState({updateTask: result.data.Items})
                this.setState({modalupdateShow:true, taskId: taskid})
            }
        });
    }

    detailmode = () =>{
        this.setState({taskId: ""})
    }

    getTaskData = (data) => {
        var header = SessionManager.shared().getAuthorizationHeader();
        Axios.get(API.GetTasks, header)
        .then(result => {
            if(!data){
                this.setState({taskOverviewData: result.data.Items, originFilterData: result.data.Items});
            }else{
                this.setState({taskOverviewData: data});
            }
            this.setState({loading:false})
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
                    "dom": 't<"bottom-datatable" lip>'
                }
            );
        });
    }

    // filter module
    setFilterData = () => {
        let filterData = [
            {"label": trls('Tasktype'), "value": "Tasktype", "type": 'text'},
            {"label": trls('Subject'), "value": "subject", "type": 'text'},
            {"label": trls('TaskStatus'), "value": "TaskStatus", "type": 'text'},
            {"label": trls('User'), "value": "User", "type": 'date'},
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
    componentWillUnmount() {
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

    render () {
        let taskOverviewData = this.state.taskOverviewData
        taskOverviewData.sort(function(a, b) {
            return a.id - b.id;
        });
        const {filterColunm} = this.state;
        return (
            <div className="order_div">
                <div className="content__header content__header--with-line">
                    <h2 className="title">{trls('Task_Overview')}</h2>
                </div>
                <div className="orders">
                    <Row>
                        <Col sm={6}>
                            <Button variant="primary" onClick={()=>this.setState({modalShow:true})}><i className="fas fa-plus add-icon"></i>{trls('Add_Task')}</Button> 
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
                            {taskOverviewData && !this.state.loading &&(<tbody >
                                {
                                    taskOverviewData.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td className={!this.showColumn(filterColunm[0].label) ? "filter-show__hide" : ''}>{i+1}</td>
                                        <td className={!this.showColumn(filterColunm[1].label) ? "filter-show__hide" : ''}>{data.Tasktype}</td>
                                        <td className={!this.showColumn(filterColunm[2].label) ? "filter-show__hide" : ''}>{data.subject}</td>
                                        <td className={!this.showColumn(filterColunm[3].label) ? "filter-show__hide" : ''}>{data.TaskStatus}</td>
                                        <td className={!this.showColumn(filterColunm[4].label) ? "filter-show__hide" : ''}>{data.User}</td>
                                        <td className={!this.showColumn(filterColunm[5].label) ? "filter-show__hide" : ''}>
                                            <Row style={{justifyContent:"center"}}>
                                                <Button id={data.id} variant="light" onClick={()=>this.getUpdateTaskData()} className="action-button"><i className="fas fa-pen add-icon"></i>{trls('Edit')}</Button>
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
                <Taskupdate
                    show={this.state.modalupdateShow}
                    onHide={() => this.setState({modalupdateShow: false})}
                    taskUpdateData={this.state.updateTask}
                    taskId={this.state.taskId}
                    detailmode={this.detailmode}
                    onGetTaskData={this.getTaskData}
                />
            </div>
        )
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Taskoverview);

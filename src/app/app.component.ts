import {Component, TemplateRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  AdditionalColumnDefine, AdditionalTableData, ColumnDefine, PopupInfo, PopupService,
  TableCellCheckboxRenderer, TableData, TableHeadCheckboxRenderer, TimeGr, TimeService
} from '@rdkmaster/jigsaw';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  beginDate = 'now-1d';
  endDate = 'now';
  rangeTimeComboValue = [
    {label: TimeService.getFormatDate(this.beginDate, TimeGr.date), closable: false},
    {label: TimeService.getFormatDate(this.endDate, TimeGr.date), closable: false}
  ];

  periodTimes = [{label: '1', closable: false}, {label: '2', closable: false}, {label: '3', closable: false},
    {label: '4', closable: false}, {label: '5', closable: false}, {label: '6', closable: false},
    {label: '7', closable: false}, {label: '8', closable: false}, {label: '9', closable: false},
    {label: '10', closable: false}, {label: '11', closable: false}, {label: '12', closable: false}];

  quickChoices = [{label: '一天', id: '1'}, {label: '三天', id: '2'}, {label: '七天', id: '3'}];

  selectedChoice = this.quickChoices[0];

  status = false;

  selectedPeriodTimes = [];

  selectBusinessType = [];

  selectInterface = [];

  userInfo = '';

  businessTypes = [{label: 'LTE用户面', closable: false}, {label: 'LTE控制面', closable: false}];

  displayTypes = [{label: '合并', id: '1'}, {label: '分表', id: '2'}];

  displayType = this.displayTypes[0];

  interfaces = [{label: 'S1-U', closable: false}, {label: 'S2-U', closable: false}];

  userTypes = [{label: 'IMSI', closable: false}, {label: 'MSISDN', closable: false}];

  selectUserType = [this.userTypes[0]];

  maxRecord = 1000;

  tableData: TableData;

  tabDatas;

  resultDisplay = false;

  tabSelectIndex = 0;

  headerData: TableData = new TableData([], ['field'], ['名称']);

  headerAdditionalData: AdditionalTableData = new AdditionalTableData();

  @ViewChild('dialog') dialog: TemplateRef<any>;

  dialogInfo: PopupInfo;

  tableColumnDefine: ColumnDefine[] = [
    {target: 'time', visible: true, width: 150},
    {target: 'interface', visible: true},
    {target: 'net', visible: true},
    {target: 'ciid', visible: true},
    {target: 'ciname', visible: true},
    {target: 'apn', visible: true, width: 230},
    {target: 'duration', visible: true}
  ];

  additionalColumns: AdditionalColumnDefine[] = [{
    pos: 0,
    header: {
      renderer: TableHeadCheckboxRenderer,
    },
    cell: {
      renderer: TableCellCheckboxRenderer,
      data: (td, row) => this.tableColumnDefine[row].visible
    }
  }];

  constructor(private http: HttpClient, private popupService: PopupService) {
    this.tableData = new TableData();
    this.tableData.http = http;
    this.tableData.onAjaxComplete(() => {
      this.tableData.header.forEach((field, index) => {
        this.headerData.data[index] = [field];
      });
    });
  }

  quickChoiceChange(quickChoice) {
    switch (quickChoice.id) {
      case '1':
        this.beginDate = 'now-1d';
        break;
      case '2':
        this.beginDate = 'now-3d';
        break;
      case '3':
        this.beginDate = 'now-1w';
        break;
    }
    this.endDate = 'now';
    this.handleChange();
  }

  handleChange() {
    this.rangeTimeComboValue = [
      {label: TimeService.getFormatDate(this.beginDate, TimeGr.date), closable: false},
      {label: TimeService.getFormatDate(this.endDate, TimeGr.date), closable: false}
    ];
  }

  displayTypeChange(displayType) {
    console.log(displayType)
  }

  doSearch() {
    this.resultDisplay = false;
    // 清理数据
    if (this.tabDatas && this.tabDatas.length !== 0) {
      this.tabDatas.forEach(tabData => {
        this[tabData.id].destroy();
      })
    }
    if (this.displayType.id === '1') {
      this.tableData.fromAjax('mock-data/table/data.json');
    } else {
      this.tabDatas = [
        {label: 'HTTP_XDR', id: 'HttpData', url: 'mock-data/table/data.json'},
        {label: 'DNS_XDR', id: 'DnsData', url: 'mock-data/table/data.json'}
      ];
      this.tabDatas.forEach(tabData => {
        this[tabData.id] = new TableData();
        this[tabData.id].http = this.http;
        this[tabData.id].fromAjax(tabData.url);
        this[tabData.id + 'ColumnDefine'] = [];
      })
    }

    this.resultDisplay = true;
  }

  customColumnDefine() {
    this.dialogInfo = this.popupService.popup(this.dialog);
  }

  finishSetting(answer: string) {
    this.dialogInfo.dispose();
    this.dialogInfo = null;
    if (answer === 'cancel') {
      return;
    }

    this.headerAdditionalData.data.forEach((visible, index) => this.tableColumnDefine[index].visible = !!visible[0]);
    this.tableData.refresh();
  }
}

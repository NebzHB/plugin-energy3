/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

var energy3data = []

function initEnergy3Panel(_eqLogic_id) {
    jeedom.eqLogic.byType({
      type : 'energy3',
      error: function (error) {
        $('#div_alert').showAlert({message: error.message, level: 'danger'});
      },
      success: function (eqLogics) {
        var li = ' <ul data-role="listview">';
        for (var i in eqLogics) {
          if (eqLogics[i].isVisible != 1) {
            continue;
          }
          li += '<li></span><a href="#" class="link" data-page="panel" data-plugin="Energy3" data-title="'  + eqLogics[i].name + '" data-option="' + eqLogics[i].id + '">' + eqLogics[i].name + '</a></li>';
        }
        li += '</ul>';
        panel(li);
      }
    });
  
    setTimeout(function(){
      displayEnergy3(_eqLogic_id,'');
    },200)
  }
  
  
function displayEnergy3(_eqLogic_id,_period) {
  setBackgroundImage('plugins/energy3/core/img/panel.jpg');
  $.showLoading();
  $.ajax({
    type: 'POST',
    url: 'plugins/energy3/core/ajax/energy3.ajax.php',
    data: {
      action: 'getPanel',
      period : _period,
      eqLogic_id : _eqLogic_id
    },
    dataType: 'json',
    error: function (request, status, error) {
      handleAjaxError(request, status, error);
    },
    success: function (data) {
          if (data.state != 'ok') {
              $('#div_alert').showAlert({message: data.result, level: 'danger'});
              return;
          }
          $('#div_displayEquipementEnergy3').empty();
          $('#div_displayEquipementEnergy3').append(data.result.html).trigger('create');
          deviceInfo = getDeviceType()
          jeedomUtils.setTileSize('.eqLogic, .scenario')
          $('.objectHtml').packery({gutter :0})
          $('.bt_changePeriod').off('click').on('click',function(){
              displayEnergy3(_eqLogic_id,$(this).attr('data-period'))
          });
          energy3data = data.result.data
          jeedom.history.chart = [];
          initGraph()
      }
  });
}


var graphOption = {
  showNavigator : false,
  showLegend : true,
  showScrollbar : true,
  showTimeSelector : true,
  disablePlotBand : true,
  pointWidth : 10,
  allowFuture : true,
  option : {displayAlert:false}
}

function initGraph(){
  
  graphOption.dateStart = energy3data.datetime.start;
  graphOption.dateEnd = energy3data.datetime.end;
  graphOption.option.graphScale = 0;
  
  if(energy3data.datetime.period == 'D' || energy3data.datetime.period == 'D-1' ){
    graphOption.el = 'div_energy3GraphConsumptionProduction';
    graphOption.cmd_id = energy3data.cmd['elec::consumption::instant'].id;
    graphOption.option = {displayAlert:false,graphColor:'#b56926',name : 'Consommation',graphType : 'column',groupingType : 'avg::hour',graphStack : true,invertData : true}

    var options = JSON.parse(JSON.stringify(graphOption));
    options.success = function(){
      graphOption.el = 'div_energy3GraphConsumptionProduction';
      graphOption.cmd_id = energy3data.cmd['elec::production::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#7ea823',name : 'Production',graphType : 'column',groupingType : 'avg::hour',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
  
      graphOption.cmd_id = energy3data.cmd['elec::import::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#283747',name : 'Import',graphType : 'column',groupingType : 'avg::hour',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
  
      graphOption.cmd_id = energy3data.cmd['elec::export::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#616A6B',name : 'Export',graphType : 'column',groupingType : 'avg::hour',graphStack: true,invertData : true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }
    jeedom.history.drawChart(options);

    if(energy3data.cmd['gaz::consumption::instant']){
      graphOption.el = 'div_energy3GraphGas';
      graphOption.cmd_id = energy3data.cmd['gaz::consumption::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#910000',name : 'Consommation',graphType : 'line'}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }else{
      $('#div_energy3GraphGas').parent().remove();
    }
    
    if(energy3data.cmd['water::consumption::instant']){
      graphOption.el = 'div_energy3GraphWater';
      graphOption.cmd_id = energy3data.cmd['water::consumption::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#2f7ed8',name : 'Consommation',graphType : 'line'}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }else{
      $('#div_energy3GraphWater').parent().remove();
    }

    graphOption.dateEnd = energy3data.datetime.end_1;
    graphOption.pointWidth = 5;
    graphOption.el = 'div_energy3GraphForecast';
    graphOption.cmd_id = energy3data.cmd['solar::forecast::now::power'].id;
    graphOption.option = {displayAlert:false,graphColor:'#FFFFFF',name : 'Prévision',graphType : 'line',groupingType : 'avg::hour'}

    var options = JSON.parse(JSON.stringify(graphOption));
    options.success = function(){
      graphOption.el = 'div_energy3GraphForecast';
      graphOption.cmd_id = energy3data.cmd['elec::production::instant'].id;
      graphOption.option = {displayAlert:false,graphColor:'#7ea823',name : 'Production',graphType : 'column',groupingType : 'avg::hour',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    };
    jeedom.history.drawChart(options);
  }else{
    graphOption.el = 'div_energy3GraphElecAuto';
    graphOption.cmd_id = energy3data.cmd['elec::selfsufficiency'].id;
    graphOption.option = {displayAlert:false,name : 'Auto-suffisance',graphType : 'column',groupingType : 'avg::day'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    graphOption.cmd_id = energy3data.cmd['elec::autoconsumption'].id;
    graphOption.option = {displayAlert:false,name : 'Auto-consommation',graphType : 'column',groupingType : 'avg::day'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    
    graphOption.el = 'div_energy3GraphConsumptionProduction';
    graphOption.cmd_id = energy3data.cmd['elec::consumption'].id;
    graphOption.option = {displayAlert:false,graphColor:'#b56926',name : 'Consommation',graphType : 'column',graphStack: true,invertData : true,}
    var options = JSON.parse(JSON.stringify(graphOption));
    options.success = function(){
      graphOption.el = 'div_energy3GraphConsumptionProduction';
      graphOption.cmd_id = energy3data.cmd['elec::production'].id;
      graphOption.option = {displayAlert:false,graphColor:'#7ea823',name : 'Production',graphType : 'column',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

      graphOption.cmd_id = energy3data.cmd['elec::import'].id;
      graphOption.option = {displayAlert:false,graphColor:'#283747',name : 'Import',graphType : 'column',graphStack: true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

      graphOption.cmd_id = energy3data.cmd['elec::export'].id;
      graphOption.option = {displayAlert:false,graphColor:'#616A6B',name : 'Export',graphType : 'column',graphStack: true,invertData : true}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }
    jeedom.history.drawChart(options);

    if(energy3data.cmd['gaz::consumption']){
      graphOption.el = 'div_energy3GraphGas';
      graphOption.cmd_id = energy3data.cmd['gaz::consumption'].id;
      graphOption.option = {displayAlert:false,graphColor:'#910000',name : 'Consommation',graphType : 'column',groupingType : 'max::day'}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }else{
      $('#div_energy3GraphWater').parent().remove();
    }

    if(energy3data.cmd['water::consumption']){
      graphOption.el = 'div_energy3GraphWater';
      graphOption.cmd_id = energy3data.cmd['water::consumption'].id;
      graphOption.option = {displayAlert:false,graphColor:'#2f7ed8',name : 'Consommation',graphType : 'column',groupingType : 'max::day'}
      jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    }else{
      $('#div_energy3GraphWater').parent().remove();
    }
  }
}
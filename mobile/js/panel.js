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
  option : {displayAlert:false}
}

function initGraph(){
  graphOption.el = 'div_energy3GraphElecAuto';
  graphOption.dateStart = energy3data.datetime.start;
  graphOption.dateEnd = energy3data.datetime.end;
  
  graphOption.option.graphScale = 0;
  graphOption.cmd_id = energy3data.cmd['elec::selfsufficiency'].id;
  jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
  graphOption.cmd_id = energy3data.cmd['elec::autoconsumption'].id;
  jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
 

  if(energy3data.datetime.period == 'D' || energy3data.datetime.period == 'D-1' ){
    graphOption.el = 'div_energy3GraphConsumptionProduction';
    graphOption.cmd_id = energy3data.cmd['elec::consumption::instant'].id;
    graphOption.option = {displayAlert:false,graphColor:'#b56926',invertData : true}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
    
    graphOption.cmd_id = energy3data.cmd['elec::production::instant'].id;
    graphOption.option = {displayAlert:false,graphColor:'#7ea823'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

    graphOption.cmd_id = energy3data.cmd['elec::import::instant'].id;
    graphOption.option = {displayAlert:false,graphColor:'#99A3A4',invertData : true}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

    graphOption.cmd_id = energy3data.cmd['elec::export::instant'].id;
    graphOption.option = {displayAlert:false,graphColor:'#99A3A4'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));


    graphOption.el = 'div_energy3GraphGas';
    graphOption.cmd_id = energy3data.cmd['gaz::consumption::instant'].id;
    graphOption.option = {displayAlert:false,graphColor:'#910000'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

    graphOption.el = 'div_energy3GraphWater';
    graphOption.cmd_id = energy3data.cmd['water::consumption::instant'].id;
    graphOption.option = {graphColor:'#2f7ed8'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
  }else{
    graphOption.el = 'div_energy3GraphConsumptionProduction';
    graphOption.cmd_id = energy3data.cmd['elec::consumption'].id;
    graphOption.option = {displayAlert:false,graphColor:'#b56926',invertData : true}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

    graphOption.cmd_id = energy3data.cmd['elec::production'].id;
    graphOption.option = {displayAlert:false,graphColor:'#7ea823'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

    graphOption.cmd_id = energy3data.cmd['elec::import'].id;
    graphOption.option = {displayAlert:false,graphColor:'#99A3A4',invertData : true}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

    graphOption.cmd_id = energy3data.cmd['elec::export'].id;
    graphOption.option = {displayAlert:false,graphColor:'#99A3A4'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));


    graphOption.el = 'div_energy3GraphGas';
    graphOption.cmd_id = energy3data.cmd['gaz::consumption'].id;
    graphOption.option = {displayAlert:false,graphColor:'#910000'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));

    graphOption.el = 'div_energy3GraphWater';
    graphOption.cmd_id = energy3data.cmd['water::consumption'].id;
    graphOption.option = {displayAlert:false,graphColor:'#2f7ed8'}
    jeedom.history.drawChart(JSON.parse(JSON.stringify(graphOption)));
  }
}
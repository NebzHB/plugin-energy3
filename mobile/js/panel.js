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
        }
    });
  }
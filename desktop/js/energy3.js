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

$(".eqLogic").off('click','.listCmdInfo').on('click','.listCmdInfo', function () {
  let el = $(this).closest('.form-group').find('.eqLogicAttr');
  if(el.length == 0){
    el = $(this).closest('.consumer').find('.consumerAttr[data-l1key=cmd]');
  }
  jeedom.cmd.getSelectModal({cmd: {type: 'info'}}, function (result) {
    if (el.attr('data-concat') == 1) {
      el.atCaret('insert', result.human);
    } else {
      el.value(result.human);
    }
  });
});

$(".eqLogic").off('click','.listCmdAction').on('click','.listCmdAction', function () {
  let el = $(this).closest('.form-group').find('.eqLogicAttr');
  jeedom.cmd.getSelectModal({cmd: {type: 'action',subType : 'other'}}, function (result) {
    if (el.attr('data-concat') == 1) {
      el.atCaret('insert', result.human);
    } else {
      el.value(result.human);
    }
  });
});

/* Permet la réorganisation des commandes dans l'équipement */
$("#table_cmd").sortable({
  axis: "y",
  cursor: "move",
  items: ".cmd",
  placeholder: "ui-state-highlight",
  tolerance: "intersect",
  forcePlaceholderSize: true
})

/* Fonction permettant l'affichage des commandes dans l'équipement */
function addCmdToTable(_cmd) {
  if (!isset(_cmd)) {
    var _cmd = {configuration: {}}
  }
  if (!isset(_cmd.configuration)) {
    _cmd.configuration = {}
  }
  var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">'
  tr += '<td class="hidden-xs">'
  tr += '<span class="cmdAttr" data-l1key="id"></span>'
  tr += '</td>'
  tr += '<td>'
  tr += '<div class="input-group">'
  tr += '<input class="cmdAttr form-control input-sm roundedLeft" data-l1key="name" placeholder="{{Nom de la commande}}">'
  tr += '<span class="input-group-btn"><a class="cmdAction btn btn-sm btn-default" data-l1key="chooseIcon" title="{{Choisir une icône}}"><i class="fas fa-icons"></i></a></span>'
  tr += '<span class="cmdAttr input-group-addon roundedRight" data-l1key="display" data-l2key="icon" style="font-size:19px;padding:0 5px 0 0!important;"></span>'
  tr += '</div>'
  tr += '</td>'
  tr += '<td>'
  tr += '<span class="type" type="' + init(_cmd.type) + '">' + jeedom.cmd.availableType() + '</span>'
  tr += '<span class="subType" subType="' + init(_cmd.subType) + '"></span>'
  tr += '</td>'
  tr += '<td>'
  tr += '<label class="checkbox-inline"><input type="checkbox" class="cmdAttr" data-l1key="isVisible" checked/>{{Afficher}}</label> '
  tr += '<label class="checkbox-inline"><input type="checkbox" class="cmdAttr" data-l1key="isHistorized" checked/>{{Historiser}}</label> '
  tr += '<label class="checkbox-inline"><input type="checkbox" class="cmdAttr" data-l1key="display" data-l2key="invertBinary"/>{{Inverser}}</label> '
  tr += '<div style="margin-top:7px;">'
  tr += '<input class="tooltips cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="minValue" placeholder="{{Min}}" title="{{Min}}" style="width:30%;max-width:80px;display:inline-block;margin-right:2px;">'
  tr += '<input class="tooltips cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="maxValue" placeholder="{{Max}}" title="{{Max}}" style="width:30%;max-width:80px;display:inline-block;margin-right:2px;">'
  tr += '<input class="tooltips cmdAttr form-control input-sm" data-l1key="unite" placeholder="Unité" title="{{Unité}}" style="width:30%;max-width:80px;display:inline-block;margin-right:2px;">'
  tr += '</div>'
  tr += '</td>'
  tr += '<td>';
  tr += '<span class="cmdAttr" data-l1key="htmlstate"></span>'; 
  tr += '</td>';
  tr += '<td>'
  if (is_numeric(_cmd.id)) {
    tr += '<a class="btn btn-default btn-xs cmdAction" data-action="configure"><i class="fas fa-cogs"></i></a> '
    tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test"><i class="fas fa-rss"></i> Tester</a>'
  }
  tr += '<i class="fas fa-minus-circle pull-right cmdAction cursor" data-action="remove" title="{{Supprimer la commande}}"></i></td>'
  tr += '</tr>'
  $('#table_cmd tbody').append(tr)
  var tr = $('#table_cmd tbody tr').last()
  jeedom.eqLogic.buildSelectCmd({
    id:  $('.eqLogicAttr[data-l1key=id]').value(),
    filter: {type: 'info'},
    error: function (error) {
      $('#div_alert').showAlert({message: error.message, level: 'danger'})
    },
    success: function (result) {
      tr.find('.cmdAttr[data-l1key=value]').append(result)
      tr.setValues(_cmd, '.cmdAttr')
      jeedom.cmd.changeType(tr, init(_cmd.subType))
    }
  })
}

$("#div_elecConsumers").off('click','.bt_removeConsumer').on('click','.bt_removeConsumer',  function () {
  $(this).closest('.consumer').remove();
});

function printEqLogic(_eqLogic) {
  actionOptions = []
  $('#div_elecConsumers').empty();
  if (isset(_eqLogic.configuration)) {
    if (isset(_eqLogic.configuration.elecConsumers)) {
      for (var i in _eqLogic.configuration.elecConsumers) {
        addElecConsumer(_eqLogic.configuration.elecConsumers[i]);
      }
    }
  }
}

function saveEqLogic(_eqLogic) {
  if (!isset(_eqLogic.configuration)) {
    _eqLogic.configuration = {};
  }
  _eqLogic.configuration.elecConsumers = $('#div_elecConsumers .consumer').getValues('.consumerAttr');
  return _eqLogic;
}


$('#bt_addElecConsumer').off('click').on('click', function () {
  addElecConsumer({});
});

function addElecConsumer(_consumer) {
  if (!isset(_consumer)) {
    _consumer = {};
  }
  let div = '<div class="consumer">';
  div += '<div class="form-group">';
  div += '<label class="col-sm-1 control-label">{{Commande}}</label>';
  div += '<div class="col-sm-3">';
  div += '<div class="input-group">';
  div += '<span class="input-group-btn">';
  div += '<a class="btn btn-default bt_removeConsumer btn-sm roundedLeft"><i class="fa fa-minus-circle"></i></a>';
  div += '</span>';
  div += '<input class="consumerAttr form-control input-sm" data-l1key="cmd" />';
  div += '<span class="input-group-btn">';
  div += '<a class="btn btn-sm listCmdInfo btn-success roundedRight"><i class="fa fa-list-alt"></i></a>';
  div += '</span>';
  div += '</div>';
  div += '</div>';
  div += '<label class="col-sm-1 control-label">{{Nom}}</label>';
  div += '<div class="col-sm-3">';
  div += '<input class="consumerAttr form-control input-sm" data-l1key="name" />';
  div += '</div>';
  div += '<label class="col-sm-2 control-label">{{Consommation par jour (si Wh ou kWh)}}</label>';
  div += '<div class="col-sm-1">';
  div += '<input type="checkbox" class="consumerAttr" data-l1key="consumptionByDay" />';
  div += '</div>';
  div += '</div>';
  div += '</div>';
  $('#div_elecConsumers').append(div);
  $('#div_elecConsumers').find('.consumer').last().setValues(_consumer, '.consumerAttr');
}
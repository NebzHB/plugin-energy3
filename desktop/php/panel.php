<?php
if (!isConnect()) {
	throw new Exception('{{401 - Accès non autorisé}}');
}
$energy3s = eqLogic::byType('energy3');
if (init('eqLogic_id') == '') {
	$energy3 = $energy3s[0];
} else {
	$energy3 = energy3::byId(init('eqLogic_id'));
}
if (!is_object($energy3)) {
	$energy3 = $energy3s[0];
}
$graphdata = array();
sendVarToJs('jeedomUtils.backgroundIMG', 'plugins/energy3/core/img/panel.jpg');
$graphData['day'] = array('start' => date('Y-m-d', strtotime('now -1 day')), 'end' => date('Y-m-d', strtotime('now')));
?>
<div class="row row-overflow" id="div_energy3">
	<div class="col-lg-2 reportModeHidden">
		<div class="bs-sidebar">
			<ul id="ul_object" class="nav nav-list bs-sidenav">
				<li class="nav-header">{{Liste des équipements}}</li>
				<li class="filter" style="margin-bottom: 5px;"><input class="filter form-control input-sm" placeholder="{{Rechercher}}" style="width: 100%" /></li>
				<?php
				foreach ($energy3s as $energy3_li) {
					if ($energy3_li->getId() == init('eqLogic_id')) {
						echo '<li class="cursor li_object active" ><a data-eqLogic_id="' . $energy3_li->getId() . '" href="index.php?v=d&p=panel&m=energy3&eqLogic_id=' . $energy3_li->getId() . '" style="padding: 2px 0px;"><span style="position:relative;">' . $energy3_li->getHumanName(true) . '</span></a></li>';
					} else {
						echo '<li class="cursor li_object" ><a data-eqLogic_id="' . $energy3_li->getId() . '" href="index.php?v=d&p=panel&m=energy3&eqLogic_id=' . $energy3_li->getId() . '" style="padding: 2px 0px;"><span style="position:relative;">' . $energy3_li->getHumanName(true) . '</span></a></li>';
					}
				}
				?>
			</ul>
		</div>
	</div>
	<?php
	if (init('report') != 1) {
		echo '<div class="col-lg-10">';
	} else {
		echo '<div class="col-lg-12">';
	}
	$panel = $energy3->generatePanel('dashboard', init('period', config::byKey('savePeriod', 'energy3')));
	echo $panel['html'];
	?>
</div>

</div>
<?php include_file('desktop', 'panel', 'js', 'energy3'); ?>
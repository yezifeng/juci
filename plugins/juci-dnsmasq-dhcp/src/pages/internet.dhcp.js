JUCI.app
.controller("InternetDHCPPage", function($scope, $uci, $rpc, $network, $config){
	$network.getNetworks().done(function(nets){
		$scope.availableNetworks = nets.map(function(n){
			return { label: n[".name"], value: n[".name"] }; 
		}); 
		$rpc.router.clients().done(function(clients){
			$uci.sync("dhcp").done(function(){
				$scope.dhcpConfigs = $uci.dhcp["@dhcp"]; 
				$scope.dhcpConfigs.map(function(dhcp){
					dhcp.staticHosts = $uci.dhcp["@host"].filter(function(host){
						return host.dhcp.value == dhcp[".name"] || (host.dhcp.value == "" && host.network.value == dhcp[".name"]);  
					}); 
					dhcp.connectedHosts = Object.keys(clients).filter(function(k){
						// filter out only clients that are connected to network that this dhcp entry is servicing
						return clients[k].network == dhcp.interface.value && clients[k].connected; 
					}).map(function(k){
						return {
							label: clients[k].hostname || clients[k].ipaddr, 
							value: clients[k]
						}; 
					}); 
					return dhcp; 
				}); 
				$scope.$apply(); 
			}); 
		}); 
	}); 
	
	$scope.onEditDHCP = function(dhcp){
		$scope.dhcp = dhcp; 
	}
	
	$scope.onRemoveDHCP = function(dhcp){
		dhcp.$delete().done(function(){
			$scope.$apply(); 
		}); 
	}
	
	$scope.onAddStaticDHCP = function(){
		if(!$scope.dhcp || !$scope.existingHost) return; 
		var host = $scope.existingHost;
		$uci.dhcp.create({
			".type": "host", 
			dhcp: $scope.dhcp[".name"], 
			network: $scope.dhcp.interface.value, 
			mac: host.macaddr, 
			ip: host.ipaddr
		}).done(function(section){
			console.log("Added new dhcp section"); 
			$scope.dhcp.staticHosts.push(section); 
			$scope.$apply(); 
		}).fail(function(err){
			console.error("Failed to add new static dhcp entry: "+err); 
		}); 
	}
	$scope.onRemoveStaticDHCP = function(host){
		if(!host || !$scope.dhcp) return; 
		host.$delete().done(function(){
			$scope.dhcp.staticHosts = $scope.dhcp.staticHosts.filter(function(x){ return x.mac.value != host.mac.value; }); 
			$scope.$apply(); 
		}); 
	}
	$scope.onExistingChanged = function(){
		if(!$scope.dhcp) return; 
		/*var item = $scope.existingHost; 
		$uci.dhcp.create({
			".type": "host", 
			name: item.hostname, 
			dhcp: $scope.dhcp[".name"], 
			network: $scope.dhcp.interface.value, 
			mac: item.macaddr, 
			ip: item.ipaddr
		}).done(function(section){
			console.log("Added static dhcp: "+JSON.stringify(item)); 
			$scope.$apply(); 
		}); */
	} 
}); 
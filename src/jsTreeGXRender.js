function jsTreeGX($)
{
	this.NodeCollection;
	this.SelectedNodes;
	this.ExpandedNodes;
	this.CheckedNodes;

	this.Theme;
	this.CustomThemePath;

	//this.Changed;
	this.Checkbox;
	//this.ConditionalSelect;
	this.ContextMenu;
	this.DragAndDrop;
	this.MassLoad;
	this.Search;
	this.Sort;
	//this.State;
	this.Types;
	this.Uniques;
	this.WholeRow;

	this.ContextMenuCollection;
	this.SearchFieldId;
	this.TypesDefinition;

	this.SetNodeCollection = function(collection) {
		this.NodeCollection = collection;
	}

	this.GetNodeCollection = function() {
		return this.NodeCollection;
	}

	this.show = function() {
		switch (this.Theme) {
			case "DefaultDark":
				var themePath = gx.util.resourceUrl(gx.basePath + gx.staticDirectory + "jsTreeGX/resources/jstree/themes/default-dark/style.min.css", false);
			case "Custom":
				var themePath = gx.util.resourceUrl(gx.basePath + gx.staticDirectory + this.CustomThemePath, false);
			case "Default":
			default:
				var themePath = gx.util.resourceUrl(gx.basePath + gx.staticDirectory + "jsTreeGX/resources/jstree/themes/default/style.min.css", false);
		}

		gx.http.loadStyle(themePath, this.CreateTree.bind(this));
	}

	this.destroy = function()
	{
		this.DestroyTree();
    	// Add your cleanup code here. This method will be called when the control is destroyed.
	}

	this.CreateTree = function() {
		let control = this;

		if (this.ContextMenu) {
			let contextMenuItems = '';
			contextMenuItems += "{";
			for (let i = 0; i < this.ContextMenuCollection.length; i++) {
				this.ProcessContextMenuCollectionItems(this.ContextMenuCollection[i]);
			}
			contextMenuItems = contextMenuItems.replace(/,\s*$/, "");
			contextMenuItems += "}";
		}

		if (this.Types) {
			let typesItems = '';
			typesItems += "{";
			for (let i = 0; i < this.TypesDefinition.length; i++) {
				typesItems += "\"" + this.TypesDefinition[i].name + "\" : {";
				typesItems += "\"icon\" : ";
				for (let j = 0; j < this.TypesDefinition[i].icon_classes.length; j++) {
					typesItems += "\"" + this.TypesDefinition[i].icon_classes[j] + "\",";
				}
				typesItems = typesItems.replace(/,\s*$/, "");
				typesItems += "}";
			}
			typesItems = typesItems.replace(/,\s*$/, "");
			typesItems += "}";
		}

		let plugins = '';
		plugins += "\"changed\","  //(this.Changed ? "changed," : "");
		plugins += (this.Checkbox ? "\"checkbox\"," : "");
		plugins += "\"conditionalselect\"," //(this.ConditionalSelect ? "conditionalselect," : "");
		plugins += (this.ContextMenu ? "\"contextmenu\"," : "");
		plugins += (this.DragAndDrop ? "\"dnd\"," : "");
		//plugins += (this.MassLoad ? "massload," : "");
		plugins += (this.Search ? "\"search\"," : "");
		plugins += (this.Sort ? "\"sort\"," : "");
		//plugins += "\"state\","; (this.State ? "\"state\"," : "");
		plugins += (this.Types ? "\"types\"," : "");
		plugins += (this.Uniques ? "\"unique\"," : "");
		plugins += (this.WholeRow ? "\"wholerow\"," : "");
		plugins = plugins.replace(/,\s*$/, "");

		let treeJson = '';
		treeJson += "{";
		treeJson += "\"core\" : ";
		treeJson += "{";
		treeJson += "\"worker\" : false,";
		treeJson += "\"data\" : " + JSON.stringify(this.NodeCollection) + ",";
		if (this.ContextMenu || this.DragAndDrop || this.Unique ) {
			treeJson += "\"check_callback\" : true,";
			$.jstree.defaults.contextmenu.items = contextMenuItems;
		}
		treeJson = treeJson.replace(/,\s*$/, "");
		treeJson +=	 "},";
		//treeJson += "\"state\" : { \"key\" : \"" + this.ContainerName + "_state\" },";
		if (this.Checkbox) {
			treeJson += "\"checkbox\" : { \"keep_selected_style\" : false },";
		}
		if (this.Types) {
			treeJson += "\"types\" : " + typesItems + " },";
		}
		treeJson += "\"plugins\" : [" + plugins + "],";
		treeJson = treeJson.replace(/,\s*$/, "");
		treeJson +=	 "}";

		var tree = JSON.parse(treeJson);

		$("#"+this.ContainerName)
			.on("init.jstree", function() { control.OnInit(control); })
			.on("loading.jstree", function() { control.OnLoading(control); })
			.on("ready.jstree", function() { control.OnReady(control); })
			.on("before_open.jstree", function(e, data) { control.OnBeforeExpandNode(data, control); })
			.on("open_node.jstree", function(e, data) { control.OnExpandNode(data, control); })
			.on("after_open.jstree", function(e, data) { control.OnAfterExpandNode(data, control); })
			.on("before_close.jstree", function(e, data) { control.OnBeforeCollapseNode(data, control); })
			.on("close_node.jstree", function(e, data) { control.OnCollapseNode(data, control); })
			.on("after_close.jstree", function(e, data) { control.OnAfterCollapseNode(data, control); })
			.on("changed.jstree", function(e, data) { control.OnSelectNode(data, control); })
			.jstree(tree);

		if (this.Search) {
			let timeOut = false
			$(this.SearchFieldId).keyup(function() {
				if (timeOut) {
					timeOut = setTimeout(function() {
						let searchQuery = $(this.SearchFieldId).val();
						$("#"+this.ContainerName).jstree(true).search(searchQuery);
					}, 250);
				}
			});
		}
	}

	this.RefreshTree = function() {
		$("#"+this.ContainerName).jstree(true).destroy(false);
		this.CreateTree.bind(this);
	}

	this.DestroyTree = function() {
		$("#"+this.ContainerName).jstree(true).destroy(false);
	}

	this.ProcessContextMenuCollectionItems = function(item) {
		contextMenuItems += "\"" + item.key  + "\" : { "
		contextMenuItems += "\"separator_before\" : " + item.Properties.seprator_before + ","
		contextMenuItems += "\"separator_after\" : " + item.Properties.separator_after + ","
		contextMenuItems += "\"_disabled\" : " + item.Properties.disabled + ","
		contextMenuItems += "\"label\" : " + item.Properties.label + ","
		contextMenuItems += "\"title\" : " + item.Properties.title + ","
		contextMenuItems += "\"action\" : function(obj) {gx.O.getUserControl(\"" + this.ContainerName + "\").ContextMenuEvent(obj," + item.Properties.eventKey + ")},"
		contextMenuItems += "\"icon\" : " + item.Properties.icon + ","
		contextMenuItems += "\"shortcut\" : " + item.Properties.shortcut + ","
		contextMenuItems += "\"shortcut_label\" : " + item.Properties.shortcut_label + ","
		if (items.Properties.submenu.length > 0) {
			contextMenuItems += "\"submenu\" : [ "
			for (let i = 0; i < item.Properties.submenu.length; i++) {
				this.ProcessContextMenuCollectionItems(item.Properties.submenu[i])
			}
			contextMenuItems = contextMenuItems.replace(/,\s*$/, "");
			contextMenuItems += " ]"
		}
		contextMenuItems += "},"
	}

	this.OnInit = function(control) {
		//
	}

	this.OnLoading = function(control) {
		//
	}

	this.OnReady = function(control) {
		//
	}

	this.OnBeforeExpandNode = function(data, control) {
		//
	}

	this.OnExpandNode = function(data, control) {
		//
	}

	this.OnAfterExpandNode = function(data, control) {
		control.OnStateChange(control);
	}

	this.OnBeforeCollapseNode = function(data, control) {
		//
	}

	this.OnCollapseNode = function(data, control) {
		//
	}

	this.OnAfterCollapseNode = function(data, control) {
		control.OnStateChange(control);
	}

	this.OnSelectNode = function(data, control) {
		control.SelectedNodes = control.GetSelected(control);
		control.SelectNode();
	}

	this.OnStateChange = function(control) {
		if (control.Checkbox)	{control.CheckedNodes = control.GetChecked(control);};
		control.SelectedNodes = control.GetSelected(control);
		control.ExpandedNodes = control.GetExpanded(control);

		control.StateChange();
	}

	this.GetCheckedNodes = function() {
		return this.CheckedNodes;
	}

	this.GetSelectedNodes = function() {
		return this.SelectedNodes;
	}

	this.GetExpandedNodes = function() {
		return this.ExpandedNodes;
	}

	this.ContextMenuEvent = function(node, key) {
		this.ContextMenuItemClicked(node, key);
	}

	this.GetSelected = function(control) {
		let nodes = control.NewNodesObject();
		$("#"+control.ContainerName).jstree(true).get_selected(false).forEach(id => nodes.Ids.push(id));
		return nodes;
	}

	this.GetChecked = function(control) {
		let nodes = control.NewNodesObject();
		$("#"+control.ContainerName).jstree(true).get_checked(false).forEach(id => nodes.Ids.push(id));
		return nodes;
	}

	this.GetExpanded = function(control) {
		let nodes = control.NewNodesObject();
		$("#"+control.ContainerName+" li.jstree-open").each(function() {nodes.Ids.push($(this).attr("id"));});
		return nodes;
	}

	this.NewNodesObject = function() {
		return {
			Ids: []
		}
	}
}

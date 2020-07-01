sap.ui.define([
    "test/SelfMonitor/controller/Base",
    "test/SelfMonitor/model/Models",
    "sap/ui/model/Filter",
    "test/SelfMonitor/utils/Utils"
], function(Base, Models, Filter, Utils) {
    "use strict";

    return Base.extend("test.SelfMonitor.controller.BaseMaster", {

        _filterList: function(sListId, aFilterBy, sQuery) {
            // Construct a filter RegExp that compares case-insensitively
            var oRegex = new RegExp(jQuery.sap.escapeRegExp(sQuery), "i");
            var fnFilter = oRegex.test.bind(oRegex);

            // Create one filter per searchable property
            var aFilters = [];
            aFilterBy.forEach(function(sProperty) {
                aFilters.push(new Filter(sProperty, fnFilter));
            });

            // Filter the list by combining all filters using OR
            var oList = this.byId(sListId);
            var oBinding = oList.getBinding("items");
            var numItems = oBinding.filter(new Filter(aFilters, false)).getLength();
            Models.getViewModel().setProperty("/count/" + sListId, numItems);
        },

        _selectItem: function(listId, modelName, selectedId, sShowDetailsMethodName, selectProperty) {
            var oList = this.byId(listId),
                aListItems = oList.getItems(),
                oSelectListItem, oInstanceData;
            oList.removeSelections();
            if (!Models.getViewModel().getProperty(selectProperty)) {
                return;
            }
            if (aListItems.length === 0) {
				if (!sap.ui.Device.system.phone) {
					this._getRouter().getTargets().display("noSelection");
					return;
				}
			}
            if (!selectedId) {
                oSelectListItem = aListItems[0];
            }else {
                oSelectListItem = Utils.arrayFind(aListItems, function(oItem) {
                    return oItem.getBindingContext(modelName).getProperty("id") === selectedId;
                });
            }
            if (oSelectListItem) {
                oList.setSelectedItem(oSelectListItem, true);
                var index = oSelectListItem.getParent().indexOfItem(oSelectListItem);
                oList.getItems()[index].focus();
                oInstanceData = oSelectListItem.getBindingContext(modelName).getProperty("");
            }
            this[sShowDetailsMethodName](oInstanceData);
        }
    });
});
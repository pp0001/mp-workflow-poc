{
	"contents": {
		"365d58f7-0f21-4861-84aa-99164cdd3d8e": {
			"classDefinition": "com.sap.bpm.wfs.Model",
			"id": "manualprocedure",
			"subject": "manualprocedure",
			"customAttributes": [{
				"id": "CustomTaskTitle",
				"label": "Custom Task Title",
				"type": "string",
				"value": "${context.text}"
			}],
			"name": "manualprocedure",
			"lastIds": "c861a0ac-6434-4f4a-977f-588037967d86",
			"events": {
				"3ac4174b-a145-441d-b7a2-60e4d2dfcda7": {
					"name": "StartEvent1"
				},
				"a979123a-3d6a-4a79-bc25-afedfcd37c64": {
					"name": "EndEvent1"
				}
			},
			"activities": {
				"330ecf2b-3ca1-4c63-bb78-63e9b209c7d2": {
					"name": "Steps"
				},
				"797f5547-9a6d-4158-8ff8-337e59cc6938": {
					"name": "Flexible"
				}
			},
			"sequenceFlows": {
				"4e273874-43b0-4e4f-9e9c-8ec45147f97b": {
					"name": "SequenceFlow1"
				},
				"339f1c1c-1ef3-4605-97e2-a8502f1b967f": {
					"name": "SequenceFlow3"
				},
				"1019c45d-e158-45ae-b75f-a96bab66d1ce": {
					"name": "SequenceFlow4"
				}
			},
			"diagrams": {
				"4412c8ec-5a7f-49e6-aeae-01aaa97f2f38": {}
			}
		},
		"3ac4174b-a145-441d-b7a2-60e4d2dfcda7": {
			"classDefinition": "com.sap.bpm.wfs.StartEvent",
			"id": "startevent1",
			"name": "StartEvent1"
		},
		"a979123a-3d6a-4a79-bc25-afedfcd37c64": {
			"classDefinition": "com.sap.bpm.wfs.EndEvent",
			"id": "endevent1",
			"name": "EndEvent1"
		},
		"330ecf2b-3ca1-4c63-bb78-63e9b209c7d2": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Steps",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"userInterface": "sapui5://comsapbpmworkflow.comsapbpmwusformplayer/com.sap.bpm.wus.form.player",
			"recipientUsers": "I320869, ${context.assign}",
			"formReference": "/forms/manualprocedure/Steps.form",
			"userInterfaceParams": [{
				"key": "formId",
				"value": "steps"
			}, {
				"key": "formRevision",
				"value": "1.0"
			}],
			"customAttributes": [],
			"id": "usertask2",
			"name": "Steps"
		},
		"797f5547-9a6d-4158-8ff8-337e59cc6938": {
			"classDefinition": "com.sap.bpm.wfs.UserTask",
			"subject": "Subject ${context.text}",
			"description": "${context.text}",
			"priority": "MEDIUM",
			"isHiddenInLogForParticipant": false,
			"userInterface": "sapui5://comflexibleflexible/com.flexible.flexible",
			"recipientUsers": "pamela.piao@sap.com",
			"userInterfaceParams": [{
				"key": "task",
				"value": "flexible"
			}],
			"customAttributes": [{
				"id": "CustomTaskTitle",
				"label": "CustomTaskTitle",
				"type": "string",
				"value": "${context.language}"
			}, {
				"id": "CustomObjectAttributeValue",
				"label": "CustomObjectAttributeValue",
				"type": "string",
				"value": "${context.text}"
			}],
			"id": "usertask3",
			"name": "Flexible"
		},
		"4e273874-43b0-4e4f-9e9c-8ec45147f97b": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow1",
			"name": "SequenceFlow1",
			"sourceRef": "3ac4174b-a145-441d-b7a2-60e4d2dfcda7",
			"targetRef": "797f5547-9a6d-4158-8ff8-337e59cc6938"
		},
		"339f1c1c-1ef3-4605-97e2-a8502f1b967f": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow3",
			"name": "SequenceFlow3",
			"sourceRef": "330ecf2b-3ca1-4c63-bb78-63e9b209c7d2",
			"targetRef": "a979123a-3d6a-4a79-bc25-afedfcd37c64"
		},
		"1019c45d-e158-45ae-b75f-a96bab66d1ce": {
			"classDefinition": "com.sap.bpm.wfs.SequenceFlow",
			"id": "sequenceflow4",
			"name": "SequenceFlow4",
			"sourceRef": "797f5547-9a6d-4158-8ff8-337e59cc6938",
			"targetRef": "330ecf2b-3ca1-4c63-bb78-63e9b209c7d2"
		},
		"4412c8ec-5a7f-49e6-aeae-01aaa97f2f38": {
			"classDefinition": "com.sap.bpm.wfs.ui.Diagram",
			"symbols": {
				"d709269e-b13b-40fc-9773-e9f1f725c738": {},
				"97e3e3f6-ad79-492a-a467-1cf768207355": {},
				"52c652b4-2e8d-4728-8450-13f4556e9039": {},
				"f7dfd495-cabb-46de-840b-995d041ff5e9": {},
				"d699d509-3f1f-4738-9640-22d83555ec2a": {},
				"382232ac-7e20-4bce-8c6f-71ccbacb1044": {},
				"74e92c40-c5aa-47a7-8fb9-672f6bbb2740": {}
			}
		},
		"d709269e-b13b-40fc-9773-e9f1f725c738": {
			"classDefinition": "com.sap.bpm.wfs.ui.StartEventSymbol",
			"x": 100,
			"y": 100,
			"width": 32,
			"height": 32,
			"object": "3ac4174b-a145-441d-b7a2-60e4d2dfcda7"
		},
		"97e3e3f6-ad79-492a-a467-1cf768207355": {
			"classDefinition": "com.sap.bpm.wfs.ui.EndEventSymbol",
			"x": 463,
			"y": 100,
			"width": 35,
			"height": 35,
			"object": "a979123a-3d6a-4a79-bc25-afedfcd37c64"
		},
		"52c652b4-2e8d-4728-8450-13f4556e9039": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "116,117 237,117",
			"sourceSymbol": "d709269e-b13b-40fc-9773-e9f1f725c738",
			"targetSymbol": "382232ac-7e20-4bce-8c6f-71ccbacb1044",
			"object": "4e273874-43b0-4e4f-9e9c-8ec45147f97b"
		},
		"f7dfd495-cabb-46de-840b-995d041ff5e9": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 325,
			"y": 88,
			"width": 100,
			"height": 60,
			"object": "330ecf2b-3ca1-4c63-bb78-63e9b209c7d2"
		},
		"d699d509-3f1f-4738-9640-22d83555ec2a": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "375,117.75 480.5,117.75",
			"sourceSymbol": "f7dfd495-cabb-46de-840b-995d041ff5e9",
			"targetSymbol": "97e3e3f6-ad79-492a-a467-1cf768207355",
			"object": "339f1c1c-1ef3-4605-97e2-a8502f1b967f"
		},
		"382232ac-7e20-4bce-8c6f-71ccbacb1044": {
			"classDefinition": "com.sap.bpm.wfs.ui.UserTaskSymbol",
			"x": 187,
			"y": 88,
			"width": 100,
			"height": 60,
			"object": "797f5547-9a6d-4158-8ff8-337e59cc6938"
		},
		"74e92c40-c5aa-47a7-8fb9-672f6bbb2740": {
			"classDefinition": "com.sap.bpm.wfs.ui.SequenceFlowSymbol",
			"points": "237,118 375,118",
			"sourceSymbol": "382232ac-7e20-4bce-8c6f-71ccbacb1044",
			"targetSymbol": "f7dfd495-cabb-46de-840b-995d041ff5e9",
			"object": "1019c45d-e158-45ae-b75f-a96bab66d1ce"
		},
		"c861a0ac-6434-4f4a-977f-588037967d86": {
			"classDefinition": "com.sap.bpm.wfs.LastIDs",
			"timereventdefinition": 1,
			"sequenceflow": 4,
			"startevent": 1,
			"endevent": 1,
			"usertask": 3
		}
	}
}
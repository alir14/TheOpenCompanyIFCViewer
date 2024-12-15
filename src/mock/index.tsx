import { TableGroupData } from "@thatopen/ui";

export const treeData: TableGroupData[] = [
    {
        data: {
            Entity: "01.ifc"
        },
        children: [
            {
                data: {
                    Entity: "IFCPROJECT",
                    Name: "0001",
                    modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                    expressID: 119,
                    relations: "[]"
                },
                children: [
                    {
                        data: {
                            Entity: "IFCSITE",
                            Name: "Default",
                            modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                            expressID: 148,
                            relations: "[]"
                        },
                        children: [
                            {
                                data: {
                                    Entity: "IFCBUILDING",
                                    Name: "",
                                    modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                    expressID: 129,
                                    relations: "[]"
                                },
                                children: [
                                    {
                                        data: {
                                            Entity: "IFCBUILDINGSTOREY",
                                            Name: "Nivel 1",
                                            modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                            expressID: 138,
                                            relations: "[186,294,338,6518,6563,6595,6627,6659,6691,6723,6755,6787,7792,18774,18799,18819,18839,18859,18879,18899,18919,18939,18959,18979,18999,19019,19039,19059,19079,19099,19119,19139,19159,19179,19199,19219,19239,19259,19279,19299,19319,19339,19359,19379,19399,19419,19439,22492,22551,22655]"
                                        },
                                        children: [
                                            {
                                                data: {
                                                    Entity: "IFCWALLSTANDARDCASE",
                                                    Name: "Muro básico:Partición con capa de yeso:163541",
                                                    modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                                    expressID: 186,
                                                    relations: "[]"
                                                },
                                                children: []
                                            },
                                            {
                                                data: {
                                                    Entity: "IFCCURTAINWALL",
                                                    Name: "Muro cortina:Muro cortina - 300 x 200 cm:166910",
                                                    modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                                    expressID: 22655,
                                                    relations: "[]"
                                                },
                                                children: [
                                                    {
                                                        data: {
                                                            Entity: "IFCPLATE",
                                                            Name: "Panel de sistema:Acristalado:166941",
                                                            modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                                            expressID: 22705,
                                                            relations: "[]"
                                                        },
                                                        children: []
                                                    },
                                                    {
                                                        data: {
                                                            Entity: "IFCPLATE",
                                                            Name: "Panel de sistema:Acristalado:166946",
                                                            modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                                            expressID: 22748,
                                                            relations: "[]"
                                                        },
                                                        children: []
                                                    },
                                                    {
                                                        data: {
                                                            Entity: "IFCMEMBER",
                                                            Name: "Montante rectangular:Montante rectangular - 5 x 10 cm:167108",
                                                            modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                                            expressID: 23865,
                                                            relations: "[]"
                                                        },
                                                        children: []
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        data: {
                                            Entity: "IFCBUILDINGSTOREY",
                                            Name: "Nivel 2",
                                            modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                            expressID: 144,
                                            relations: "[22620]"
                                        },
                                        children: [
                                            {
                                                data: {
                                                    Entity: "IFCSLAB",
                                                    Name: "Suelo:Por defecto - 30 cm:166811",
                                                    modelID: "490e2278-f543-40b7-a371-ff5e87d8a2ad",
                                                    expressID: 22620,
                                                    relations: "[]"
                                                },
                                                children: []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

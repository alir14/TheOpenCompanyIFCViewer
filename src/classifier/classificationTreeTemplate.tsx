import React, { useEffect, useState } from 'react';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';

interface ClassificationTreeTemplateProps {
    components: OBC.Components;
    classifications: (string | { system: string; label: string })[];
}

const ClassificationTreeTemplate: React.FC<ClassificationTreeTemplateProps> = ({ components, classifications }) => {
    const [rows, setRows] = useState<BUI.TableGroupData[]>([]);

    useEffect(() => {
        const classifier = components.get(OBC.Classifier);
        const hider = components.get(OBC.Hider);

        const createRows = () => {
            const newRows: BUI.TableGroupData[] = [];

            classifications.forEach((classification) => {
                const system =
                    typeof classification === 'string'
                        ? classification
                        : classification.system;

                const label =
                    typeof classification === 'string'
                        ? classification
                        : classification.label;

                const groups = classifier.list[system];
                if (!groups) return;

                newRows.push({
                    data: { Name: label, system },
                    children: Object.keys(groups).map((group) => ({
                        data: { Name: group, system, Actions: '' },
                    })),
                });
            });

            setRows(newRows);
        };

        createRows();
    }, [classifications, components]);

    const renderActions = (rowData: Partial<BUI.TableRowData<Record<string, BUI.TableCellValue>>>) => {
        const { system, Name } = rowData;
        if (!(typeof system === 'string' && typeof Name === 'string')) return null;

        const classifier = components.get(OBC.Classifier);
        const hider = components.get(OBC.Hider);

        const groups = classifier.list[system];
        if (!(groups && groups[Name])) return null;

        const { map: fragmentIdMap } = groups[Name];

        const onVisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            hider.set(e.target.checked, fragmentIdMap);
        };

        return (
            <div>
                <input
                    type="checkbox"
                    defaultChecked
                    onChange={onVisibilityChange}
                />
            </div>
        );
    };

    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, index) => (
                    <React.Fragment key={index}>
                        <tr>
                            <td>{row.data.Name}</td>
                            <td>{row.children && row.children.length ? '' : renderActions(row.data)}</td>
                        </tr>
                        {row.children &&
                            row.children.map((child, idx) => (
                                <tr key={`${index}-${idx}`}>
                                    <td style={{ paddingLeft: '20px' }}>{child.data.Name}</td>
                                    <td>{renderActions(child.data)}</td>
                                </tr>
                            ))}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};

export default ClassificationTreeTemplate;

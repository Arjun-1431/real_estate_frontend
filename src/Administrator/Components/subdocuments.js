import { useState, useEffect } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getApiUrl } from '../../utils/api';

export default function Subdocuments() {
    const [documents, setDocuments] = useState({});
    const [expandedOwners, setExpandedOwners] = useState({});
    const [search, setSearch] = useState(''); // State for the search input

    useEffect(() => {
        axios.get(getApiUrl('/getdocument'))
            .then(response => {
                setDocuments(response.data.documents);
            })
            .catch(error => {
                console.log('Error fetching documents:', error);
            });
    }, []);

    const truncate = (str, n) => {
        return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
    };

    const toggleExpand = (ownerId) => {
        setExpandedOwners(prevState => ({
            ...prevState,
            [ownerId]: !prevState[ownerId]
        }));
    };

    const downloadZip = async (objectId) => {
        const zip = new JSZip();
        const ownerDocuments = documents[objectId];

        for (const doc of ownerDocuments) {
            try {
                const response = await axios.get(getApiUrl(`/documents/${encodeURIComponent(doc.doc)}`), {
                    responseType: 'blob'
                });
                zip.file(doc.doc, response.data);
            } catch (error) {
                console.error(`Error fetching document ${doc.doc}:`, error);
            }
        }

        zip.generateAsync({ type: 'blob' })
            .then(content => {
                saveAs(content, `documents-${objectId}.zip`);
            })
            .catch(error => {
                console.error('Error creating ZIP file:', error);
            });
    };

    // Filter documents based on search input
    const filteredDocuments = Object.keys(documents).filter(objectId => {
        const ownerDocuments = documents[objectId];
        const ownerName = ownerDocuments[0].name.toLowerCase();
        return ownerName.includes(search.toLowerCase());
    });

    return (
        <div className="flex flex-col items-center" style={{ margin: '2%' }}>
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search by owner name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 p-2 border rounded shadow-md w-full max-w-md"
            />

            {/* Document Cards */}
            <div className="flex flex-wrap justify-center">
                {filteredDocuments.length > 0 ? (
                    filteredDocuments.map(objectId => {
                        const ownerDocuments = documents[objectId];
                        const isExpanded = expandedOwners[objectId];
                        const visibleDocuments = isExpanded ? ownerDocuments : ownerDocuments.slice(0, 2);

                        return (
                            <div key={objectId} className="w-full max-w-sm p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow sm:p-6 dark:bg-gray-800 dark:border-gray-700 mx-2">
                                <h5 className="mb-3 text-base font-semibold text-gray-900 md:text-xl dark:text-white">
                                    Document Owner: {ownerDocuments[0].name}
                                </h5>

                                <ul className="my-4 space-y-3">
                                    {visibleDocuments.map(doc => (
                                        <li key={doc._id}>
                                            <a href={getApiUrl(`/documents/${encodeURIComponent(doc.doc)}`)} target="_blank" className="flex items-center p-3 text-base font-bold text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white" download>
                                                <span className="flex-1 ms-3 whitespace-nowrap">{truncate(doc.doc, 20)}</span>
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">Download</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>

                                {ownerDocuments.length > 2 && (
                                    <button
                                        onClick={() => toggleExpand(objectId)}
                                        className="text-blue-500 hover:underline mb-2"
                                    >
                                        {isExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                )}

                                <button
                                    onClick={() => downloadZip(objectId)}
                                    className="px-4 py-2 mt-4 mr-7 text-blue-600  rounded-lg"
                                >
                                    Download All as ZIP
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500">No document owners found.</p>
                )}
            </div>
        </div>
    );
}

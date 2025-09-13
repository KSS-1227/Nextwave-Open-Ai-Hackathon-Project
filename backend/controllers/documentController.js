const { getAuthenticatedClient } = require("../config/supabase");
const { asyncHandler } = require("../middleware/errorHandler");

// Get all documents for the authenticated user
const getDocuments = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);

  const { page = 1, limit = 10, doc_type, status } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("documents")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (doc_type) {
    query = query.eq("doc_type", doc_type);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data: documents, error, count } = await query;

  if (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch documents",
      data: null,
    });
  }

  res.json({
    success: true,
    data: {
      documents: documents || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    },
    error: null,
  });
});

// Get a specific document by ID
const getDocument = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);
  const { id } = req.params;

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", req.user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        data: null,
      });
    }

    console.error("Error fetching document:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch document",
      data: null,
    });
  }

  res.json({
    success: true,
    data: document,
    error: null,
  });
});

// Create a new document record
const createDocument = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);

  const {
    file_name,
    file_url,
    doc_type = "general",
    extracted_text,
    file_size,
    mime_type,
  } = req.body;

  // Validate required fields
  if (!file_name || !file_url) {
    return res.status(400).json({
      success: false,
      error: "File name and file URL are required",
      data: null,
    });
  }

  const documentData = {
    user_id: req.user.id,
    file_name,
    file_url,
    doc_type,
    extracted_text,
    file_size: file_size ? parseInt(file_size) : null,
    mime_type,
    status: "uploaded",
  };

  const { data: document, error } = await supabase
    .from("documents")
    .insert(documentData)
    .select()
    .single();

  if (error) {
    console.error("Error creating document:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create document record",
      data: null,
    });
  }

  res.status(201).json({
    success: true,
    data: document,
    error: null,
  });
});

// Update a document
const updateDocument = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);
  const { id } = req.params;

  const { file_name, doc_type, extracted_text, status } = req.body;

  const updateData = {};

  if (file_name !== undefined) updateData.file_name = file_name;
  if (doc_type !== undefined) updateData.doc_type = doc_type;
  if (extracted_text !== undefined) updateData.extracted_text = extracted_text;
  if (status !== undefined) {
    // Validate status
    const validStatuses = ["uploaded", "processing", "processed", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
        data: null,
      });
    }
    updateData.status = status;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      error: "No valid fields to update",
      data: null,
    });
  }

  const { data: document, error } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        data: null,
      });
    }

    console.error("Error updating document:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update document",
      data: null,
    });
  }

  res.json({
    success: true,
    data: document,
    error: null,
  });
});

// Delete a document
const deleteDocument = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);
  const { id } = req.params;

  const { data, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        data: null,
      });
    }

    console.error("Error deleting document:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete document",
      data: null,
    });
  }

  res.json({
    success: true,
    data: { message: "Document deleted successfully" },
    error: null,
  });
});

// Get document statistics
const getDocumentStats = asyncHandler(async (req, res) => {
  const supabase = getAuthenticatedClient(req.accessToken);

  // Get counts by status
  const { data: statusCounts, error: statusError } = await supabase
    .from("documents")
    .select("status")
    .eq("user_id", req.user.id);

  if (statusError) {
    console.error("Error fetching document stats:", statusError);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch document statistics",
      data: null,
    });
  }

  // Count by status
  const stats = {
    total: statusCounts.length,
    uploaded: statusCounts.filter((doc) => doc.status === "uploaded").length,
    processing: statusCounts.filter((doc) => doc.status === "processing")
      .length,
    processed: statusCounts.filter((doc) => doc.status === "processed").length,
    failed: statusCounts.filter((doc) => doc.status === "failed").length,
  };

  // Get counts by document type
  const { data: typeCounts, error: typeError } = await supabase
    .from("documents")
    .select("doc_type")
    .eq("user_id", req.user.id);

  if (!typeError) {
    const typeStats = {};
    typeCounts.forEach((doc) => {
      typeStats[doc.doc_type] = (typeStats[doc.doc_type] || 0) + 1;
    });
    stats.by_type = typeStats;
  }

  res.json({
    success: true,
    data: stats,
    error: null,
  });
});

module.exports = {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
};

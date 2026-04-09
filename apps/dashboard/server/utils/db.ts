import { useSupabaseAdmin } from "./supabase";

/**
 * Generic query helper that parses basic SQL SELECT statements.
 * Supports WHERE clauses with positional parameters ($1, $2, etc).
 * 
 * Example:
 *  query("SELECT * FROM projects WHERE user_id = $1 AND state = $2", [userId, "ACTIVE"])
 */
export async function query(sql: string, params: any[] = []): Promise<any[]> {
    const sb = useSupabaseAdmin();
    
    // Parse the SQL to extract table name and WHERE conditions
    const selectMatch = sql.match(/FROM\s+(\w+)/i);
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:ORDER|LIMIT|$)/i);
    
    if (!selectMatch) {
        throw new Error("Invalid SQL: Cannot determine table name");
    }
    
    const table = selectMatch[1];
    let query = sb.from(table).select("*");
    
    // Parse WHERE clause and apply conditions
    if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        
        // Simple WHERE parser for "col1 = $1 AND col2 = $2" style conditions
        const conditions = whereClause.split(/\s+AND\s+/i);
        let paramIndex = 0;
        
        for (const condition of conditions) {
            const match = condition.match(/(\w+)\s*=\s*\$(\d+)/);
            if (match) {
                const column = match[1];
                const paramNum = parseInt(match[2]) - 1; // Convert $1 to index 0
                query = query.eq(column, params[paramNum]);
            }
        }
    }
    
    // Handle ORDER BY and LIMIT
    const orderMatch = sql.match(/ORDER BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
        const column = orderMatch[1];
        const order = (orderMatch[2] || "ASC").toUpperCase() === "DESC";
        query = query.order(column, { ascending: !order });
    }
    
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
        throw new Error(`Database query failed: ${error.message}`);
    }
    
    return data || [];
}

/**
 * Execute a query and return a single row.
 */
export async function queryOne(sql: string, params: any[] = []): Promise<any> {
    const results = await query(sql, params);
    return results.length ? results[0] : null;
}

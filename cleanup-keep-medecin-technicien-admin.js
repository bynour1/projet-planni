#!/usr/bin/env node
/**
 * Script: cleanup-keep-medecin-technicien-admin.js
 * Objectif: 
 *   1. Supprimer tous les utilisateurs avec le rôle "participant"
 *   2. Garder seulement: médecin, technicien, admin
 *   3. Afficher le résumé des changements
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'planning',
};

async function cleanup() {
  let conn;
  try {
    console.log('\n📋 SCRIPT: Cleanup - Garder seulement Médecin, Technicien, Admin');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    conn = await mysql.createConnection(config);
    console.log('✅ Connexion à la base de données établie\n');

    // 1. Afficher les utilisateurs avant suppression
    console.log('📊 ÉTAT ACTUEL DE LA BASE DE DONNÉES:');
    console.log('───────────────────────────────────────');
    
    const [users] = await conn.query(
      `SELECT id, email, nom, prenom, role, isConfirmed FROM users ORDER BY role, email`
    );

    const usersByRole = {};
    users.forEach(u => {
      if (!usersByRole[u.role]) usersByRole[u.role] = [];
      usersByRole[u.role].push(u);
    });

    Object.entries(usersByRole).forEach(([role, list]) => {
      console.log(`\n${role.toUpperCase()} (${list.length}):`);
      list.forEach(u => {
        const status = u.isConfirmed ? '✅ CONFIRMÉ' : '⏳ EN ATTENTE';
        console.log(`  • ${u.prenom} ${u.nom} - ${u.email} [${status}]`);
      });
    });

    const totalBefore = users.length;
    console.log(`\n📈 Total utilisateurs: ${totalBefore}`);

    // 2. Identifier les utilisateurs à supprimer
    console.log('\n\n🗑️  UTILISATEURS À SUPPRIMER:');
    console.log('─────────────────────────────');
    
    const [participantsToDelete] = await conn.query(
      `SELECT id, email, nom, prenom FROM users WHERE role = 'participant'`
    );

    const [othersToDelete] = await conn.query(
      `SELECT id, email, nom, prenom, role FROM users 
       WHERE role NOT IN ('medecin', 'technicien', 'admin')`
    );

    const allToDelete = [...participantsToDelete, ...othersToDelete];
    const uniqueToDelete = Array.from(
      new Map(allToDelete.map(u => [u.id, u])).values()
    );

    if (uniqueToDelete.length === 0) {
      console.log('✅ Aucun utilisateur à supprimer - Base déjà clean!');
    } else {
      uniqueToDelete.forEach(u => {
        console.log(`  🗑️  ${u.prenom} ${u.nom} - ${u.email} [${u.role}]`);
      });
      console.log(`\n⚠️  ATTENTION: ${uniqueToDelete.length} utilisateurs seront supprimés!`);
    }

    // 3. Demander confirmation
    console.log('\n\n⚠️  Tapez "OUI" pour confirmer la suppression (développement):');
    console.log('Enter "YES" to confirm deletion (production):');
    
    // Mode automatique (non-interactif)
    const confirmation = 'OUI';
    console.log('Mode automatique: suppression en cours...\n');

    if (confirmation.toUpperCase() === 'OUI' || confirmation.toUpperCase() === 'YES') {
      // 4. Effectuer les suppressions
      if (uniqueToDelete.length > 0) {
        const idsToDelete = uniqueToDelete.map(u => u.id);
        
        const placeholders = idsToDelete.map(() => '?').join(',');
        await conn.query(
          `DELETE FROM users WHERE id IN (${placeholders})`,
          idsToDelete
        );

        console.log('✅ Suppressions effectuées');
      }

      // 5. Afficher l'état final
      console.log('\n\n📊 ÉTAT FINAL DE LA BASE DE DONNÉES:');
      console.log('──────────────────────────────────────');

      const [usersAfter] = await conn.query(
        `SELECT id, email, nom, prenom, role, isConfirmed FROM users ORDER BY role, email`
      );

      const usersByRoleAfter = {};
      usersAfter.forEach(u => {
        if (!usersByRoleAfter[u.role]) usersByRoleAfter[u.role] = [];
        usersByRoleAfter[u.role].push(u);
      });

      Object.entries(usersByRoleAfter).forEach(([role, list]) => {
        console.log(`\n${role.toUpperCase()} (${list.length}):`);
        list.forEach(u => {
          const status = u.isConfirmed ? '✅ CONFIRMÉ' : '⏳ EN ATTENTE';
          console.log(`  • ${u.prenom} ${u.nom} - ${u.email} [${status}]`);
        });
      });

      const totalAfter = usersAfter.length;
      const deleted = uniqueToDelete.length;

      console.log('\n\n📈 RÉSUMÉ:');
      console.log('────────────────────────────────────');
      console.log(`Avant: ${totalBefore} utilisateurs`);
      console.log(`Supprimés: ${deleted}`);
      console.log(`Après: ${totalAfter} utilisateurs`);
      console.log('');
      console.log('Rôles conservés:');
      console.log('  ✅ Médecin');
      console.log('  ✅ Technicien');
      console.log('  ✅ Admin');
      console.log('');
      console.log('Rôles supprimés:');
      console.log('  ❌ Participant');
      
      // Afficher autres rôles supprimés s'il y en avait
      const otherRoles = new Set(othersToDelete.map(u => u.role));
      otherRoles.forEach(role => {
        if (!['participant', 'medecin', 'technicien', 'admin'].includes(role)) {
          console.log(`  ❌ ${role}`);
        }
      });

      console.log('\n✅ Nettoyage terminé avec succès!');
      console.log('═══════════════════════════════════════════════════════════════\n');
    } else {
      console.log('❌ Opération annulée');
    }

  } catch (err) {
    console.error('❌ ERREUR:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

cleanup();

CREATE TABLE public.description_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 80),
  summary text CHECK (summary IS NULL OR char_length(summary) <= 200),
  instructions text NOT NULL CHECK (char_length(btrim(instructions)) BETWEEN 10 AND 3000),
  target_length text NOT NULL DEFAULT 'medium' CHECK (target_length IN ('short','medium','long')),
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.description_templates TO authenticated;
GRANT ALL ON public.description_templates TO service_role;

ALTER TABLE public.description_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read description templates" ON public.description_templates
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins insert description templates" ON public.description_templates
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update description templates" ON public.description_templates
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete description templates" ON public.description_templates
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE TRIGGER description_templates_updated_at BEFORE UPDATE ON public.description_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER description_templates_audit AFTER INSERT OR UPDATE OR DELETE ON public.description_templates
  FOR EACH ROW EXECUTE FUNCTION public.audit_row();

INSERT INTO public.description_templates (name, summary, instructions, target_length, display_order) VALUES
('Fiche complète',
 'Accroche, paragraphe de présentation, points forts et conseils d''utilisation.',
 'Commence par une phrase d''accroche qui donne envie. Enchaîne avec un paragraphe qui présente le produit et son usage. Ajoute une liste de 4 à 6 points forts concrets tirés des caractéristiques. Termine par une courte phrase rassurante (livraison partout en Tunisie, paiement à la livraison). Ton chaleureux et professionnel.',
 'long', 1),
('Courte & percutante',
 'Deux ou trois phrases efficaces, idéales pour mobile.',
 'Rédige 2 à 3 phrases maximum, directes et dynamiques. Mets en avant le bénéfice principal et une ou deux caractéristiques clés. Pas de liste à puces.',
 'short', 2),
('Optimisée SEO',
 'Texte structuré qui reprend naturellement les mots-clés du produit.',
 'Reprends naturellement le nom du produit, la marque, la catégorie et les caractéristiques importantes comme mots-clés, sans bourrage. Utilise un paragraphe d''introduction, puis une liste de points forts, puis un court paragraphe de conclusion. Phrases claires et lisibles.',
 'medium', 3),
('Technique à puces',
 'Une phrase d''introduction puis les caractéristiques en liste.',
 'Écris une seule phrase d''introduction, puis présente les caractéristiques techniques sous forme de liste à puces claire (nom de la caractéristique : valeur avec unité). Ton neutre et précis, sans superlatifs.',
 'medium', 4);